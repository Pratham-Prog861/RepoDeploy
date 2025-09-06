import { Octokit } from '@octokit/rest';
import JSZip from 'jszip';
import { createDeployment, addBuildLog, updateDeployment } from '@/lib/supabase';
import { deployToVercel } from '@/lib/vercel-deploy';
import { deploymentConfig, isSimulationMode } from '@/lib/config';

// GitHub API configuration
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export function generateDeploymentId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function validateGitHubUrl(url: string): { owner: string; repo: string } | null {
  const githubPattern = /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\.git|\/)?$/;
  const match = url.match(githubPattern);
  
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2]
  };
}

async function downloadRepository(owner: string, repo: string): Promise<ArrayBuffer> {
  try {
    const { data } = await octokit.rest.repos.downloadZipballArchive({
      owner,
      repo,
      ref: 'main' // Try main branch first
    });
    return data as ArrayBuffer;
  } catch (error) {
    // Try master branch if main fails
    const { data } = await octokit.rest.repos.downloadZipballArchive({
      owner,
      repo,
      ref: 'master'
    });
    return data as ArrayBuffer;
  }
}

async function processRepository(zipData: ArrayBuffer): Promise<{ files: { [key: string]: string }, hasPackageJson: boolean, buildDir: string }> {
  const zip = new JSZip();
  const zipFiles = await zip.loadAsync(zipData);
  
  const files: { [key: string]: string } = {};
  let hasPackageJson = false;
  let rootDir = '';
  
  // Find the root directory (GitHub creates a folder like "repo-main")
  const fileNames = Object.keys(zipFiles.files);
  if (fileNames.length > 0) {
    rootDir = fileNames[0].split('/')[0];
  }
  
  // Extract files with size filtering
  let totalSize = 0;
  const maxFileSize = 1024 * 1024 * 20; // 20MB per file
  const maxTotalSize = 40 * 1024 * 1024; // 10MB total (leaving 2MB buffer for Vercel's 10MB limit)
  
  for (const [path, file] of Object.entries(zipFiles.files)) {
    if (!file.dir) {
      const relativePath = path.replace(`${rootDir}/`, '');
      
      // Skip large files (images, videos, audio)
      const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mp3', '.wav', '.zip', '.tar', '.gz'];
      const shouldSkip = skipExtensions.some(ext => relativePath.toLowerCase().endsWith(ext));
      
      if (shouldSkip) {
        console.log(`Skipping large file: ${relativePath}`);
        continue;
      }
      
      if (relativePath === 'package.json') {
        hasPackageJson = true;
      }
      
      try {
        const content = await file.async('text');
        const fileSize = new Blob([content]).size;
        
        // Skip files that are too large
        if (fileSize > maxFileSize) {
          console.log(`Skipping large file (${fileSize} bytes): ${relativePath}`);
          continue;
        }
        
        // Check total size limit
        if (totalSize + fileSize > maxTotalSize) {
          console.log(`Reached size limit, skipping remaining files`);
          break;
        }
        
        files[relativePath] = content;
        totalSize += fileSize;
      } catch (error) {
        console.warn(`Failed to process file ${relativePath}:`, error);
        // Skip files that can't be processed as text
        continue;
      }
    }
  }
  
  // Determine build directory
  const buildDir = hasPackageJson ? 'dist' : '.';
  
  return { files, hasPackageJson, buildDir };
}

async function simulateBuild(files: { [key: string]: string }, hasPackageJson: boolean, deploymentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (hasPackageJson) {
      await addBuildLog(deploymentId, 'Installing dependencies...');
      // Simulate npm install delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await addBuildLog(deploymentId, 'Building project...');
      
      // Check if there's a build script in package.json
      const packageJsonContent = files['package.json'];
      if (packageJsonContent) {
        const packageJson = JSON.parse(packageJsonContent);
        if (packageJson.scripts?.build) {
          await addBuildLog(deploymentId, `Running: npm run build`);
          // Simulate build time
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          await addBuildLog(deploymentId, 'No build script found, using files as-is');
        }
      }
    } else {
      await addBuildLog(deploymentId, 'Static files detected, no build process needed');
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Build failed' 
    };
  }
}

export async function startDeployment(repoUrl: string): Promise<{ deploymentId: string; liveUrl: string | null; status: string }> {
  // Validate GitHub URL
  const repoInfo = validateGitHubUrl(repoUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const { owner, repo } = repoInfo;
  const deploymentId = generateDeploymentId();
  let liveUrl: string | null = null;
  
  // For simulation mode, set liveUrl to null
  if (isSimulationMode()) {
    liveUrl = null;
  }
  
  // Create deployment record
  await createDeployment({
    id: deploymentId,
    repo_url: repoUrl,
    status: 'pending',
    live_url: liveUrl,
    build_logs: ['Deployment initiated...'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Start deployment process (non-blocking)
  processDeployment(deploymentId, owner, repo, repoUrl).catch(console.error);
  
  return {
    deploymentId,
    liveUrl,
    status: 'pending'
  };
}

async function processDeployment(deploymentId: string, owner: string, repo: string, repoUrl: string) {
  try {
    // Update status to building
    await updateDeployment(deploymentId, { status: 'building' });
    await addBuildLog(deploymentId, 'Starting build process...');
    
    // Download repository
    await addBuildLog(deploymentId, `Cloning ${owner}/${repo}...`);
    const zipData = await downloadRepository(owner, repo);
    
    // Process repository files
    await addBuildLog(deploymentId, 'Processing repository files...');
    const { files, hasPackageJson, buildDir } = await processRepository(zipData);
    
    // Simulate build process
    const buildResult = await simulateBuild(files, hasPackageJson, deploymentId);
    
    if (!buildResult.success) {
      await updateDeployment(deploymentId, {
        status: 'failed',
        error_message: buildResult.error || 'Build failed'
      });
      await addBuildLog(deploymentId, `Build failed: ${buildResult.error}`);
      return;
    }
    
    let liveUrl: string | null = null;
    
    if (isSimulationMode()) {
      // Simulate deployment to hosting
      await addBuildLog(deploymentId, 'Simulating deployment to hosting...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await addBuildLog(deploymentId, 'Simulation deployment successful! 🚀 (Demo mode)');
    } else {
      // Real deployment to Vercel
      await addBuildLog(deploymentId, 'Deploying to Vercel...');
      
      try {
        // Check if Vercel token is configured
        if (!process.env.VERCEL_TOKEN || process.env.VERCEL_TOKEN === 'your_vercel_token_here') {
          throw new Error('VERCEL_TOKEN not configured. Please add your Vercel token to the .env file.');
        }
        
        const projectName = `${owner}-${repo}-${deploymentId}`;
        const vercelResult = await deployToVercel(files, projectName, repoUrl);
        
        liveUrl = vercelResult.url;
        await addBuildLog(deploymentId, `Deployment created: ${liveUrl}`);
        
        // Wait for deployment to be ready
        await addBuildLog(deploymentId, 'Waiting for deployment to be ready...');
        
        // Note: In a production app, you might want to poll Vercel's API to check deployment status
        // For now, we'll assume it's ready after a short delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await addBuildLog(deploymentId, 'Vercel deployment successful! 🚀');
      } catch (vercelError) {
        const errorMessage = vercelError instanceof Error ? vercelError.message : 'Unknown error';
        await addBuildLog(deploymentId, `Vercel deployment failed: ${errorMessage}`);
        throw new Error(`Vercel deployment failed: ${errorMessage}`);
      }
    }
    
    // Mark as deployed
    await updateDeployment(deploymentId, { 
      status: 'deployed',
      live_url: liveUrl
    });
    
  } catch (error) {
    console.error('Build process error:', error);
    
    await updateDeployment(deploymentId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    await addBuildLog(deploymentId, `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
