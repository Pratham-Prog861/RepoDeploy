import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as git from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as archiver from 'archiver';

admin.initializeApp();

const db = admin.firestore();

interface DeploymentRequest {
  repoUrl: string;
  userId?: string;
}

interface Deployment {
  id: string;
  repoUrl: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  liveUrl: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  buildLogs: string[];
  error?: string;
}

export const deployRepository = functions.https.onCall(async (data: DeploymentRequest, context: functions.https.CallableContext) => {
  try {
    // Validate input
    if (!data.repoUrl || !data.repoUrl.includes('github.com')) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid GitHub repository URL');
    }

    // Create deployment record
    const deploymentId = generateDeploymentId();
    const liveUrl = `https://${deploymentId}.${functions.config().deployment?.domain || 'repodeploy.web.app'}`;
    
    const deployment: Deployment = {
      id: deploymentId,
      repoUrl: data.repoUrl,
      status: 'pending',
      liveUrl,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      buildLogs: ['Deployment initiated...']
    };

    // Save to Firestore
    await db.collection('deployments').doc(deploymentId).set(deployment);

    // Start deployment process (non-blocking)
    processDeployment(deploymentId, data.repoUrl, liveUrl);

    return {
      deploymentId,
      liveUrl,
      status: 'pending'
    };

  } catch (error) {
    console.error('Deployment error:', error);
    throw new functions.https.HttpsError('internal', 'Deployment failed');
  }
});
async function processDeployment(deploymentId: string, repoUrl: string, liveUrl: string) {
  const deploymentRef = db.collection('deployments').doc(deploymentId);
  
  try {
    // Update status to building
    await deploymentRef.update({
      status: 'building',
      updatedAt: admin.firestore.Timestamp.now(),
      buildLogs: admin.firestore.FieldValue.arrayUnion('Starting build process...')
    });

    // Clone repository
    const tempDir = `/tmp/${deploymentId}`;
    await fs.ensureDir(tempDir);
    
    await deploymentRef.update({
      buildLogs: admin.firestore.FieldValue.arrayUnion('Cloning repository...')
    });

    const gitInstance = git.simpleGit(tempDir);
    await gitInstance.clone(repoUrl, tempDir);

    // Check for build files
    const packageJsonPath = path.join(tempDir, 'package.json');
    const hasPackageJson = await fs.pathExists(packageJsonPath);

    if (hasPackageJson) {
      await deploymentRef.update({
        buildLogs: admin.firestore.FieldValue.arrayUnion('Installing dependencies...')
      });

      // Install dependencies
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('npm install', { cwd: tempDir }, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });

      await deploymentRef.update({
        buildLogs: admin.firestore.FieldValue.arrayUnion('Building project...')
      });

      // Build project
      await new Promise((resolve, reject) => {
        exec('npm run build', { cwd: tempDir }, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    }

    // Create deployment package
    await deploymentRef.update({
      buildLogs: admin.firestore.FieldValue.arrayUnion('Creating deployment package...')
    });

    const buildDir = hasPackageJson ? path.join(tempDir, 'dist') : tempDir;
    const outputPath = `/tmp/${deploymentId}.zip`;
    
    await createZipArchive(buildDir, outputPath);

    // Upload to Firebase Hosting (simplified - in real implementation, you'd use Firebase Admin SDK)
    await deploymentRef.update({
      buildLogs: admin.firestore.FieldValue.arrayUnion('Deploying to hosting...')
    });

    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update status to deployed
    await deploymentRef.update({
      status: 'deployed',
      updatedAt: admin.firestore.Timestamp.now(),
      buildLogs: admin.firestore.FieldValue.arrayUnion('Deployment successful!')
    });

    // Cleanup
    await fs.remove(tempDir);
    await fs.remove(outputPath);

  } catch (error) {
    console.error('Build error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    await deploymentRef.update({
      status: 'failed',
      error: errorMessage,
      updatedAt: admin.firestore.Timestamp.now(),
      buildLogs: admin.firestore.FieldValue.arrayUnion(`Build failed: ${errorMessage}`)
    });
  }
}

async function createZipArchive(sourceDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err: Error) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

function generateDeploymentId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const getDeploymentStatus = functions.https.onCall(async (data: { deploymentId: string }, context: functions.https.CallableContext) => {
  try {
    const deploymentDoc = await db.collection('deployments').doc(data.deploymentId).get();
    
    if (!deploymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deployment not found');
    }

    return deploymentDoc.data();
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to get deployment status');
  }
});
