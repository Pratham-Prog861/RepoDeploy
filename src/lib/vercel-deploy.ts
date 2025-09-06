export interface VercelFile {
  file: string;
  data: string;
}

export interface VercelDeploymentResponse {
  url: string;
  deploymentId: string;
  readyState: string;
  alias?: string[];
}

export async function deployToVercel(
  files: { [key: string]: string },
  projectName: string,
  repoUrl: string
): Promise<VercelDeploymentResponse> {
  const vercelToken = process.env.VERCEL_TOKEN;
  
  if (!vercelToken) {
    throw new Error('VERCEL_TOKEN environment variable is required for real deployments');
  }

  // Convert files to Vercel format (array of file objects)
  const vercelFiles: VercelFile[] = [];
  
  Object.entries(files).forEach(([path, content]) => {
    // Clean up the path (remove leading slashes)
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    vercelFiles.push({
      file: cleanPath,
      data: content
    });
  });

  // Ensure we have at least an index.html for static sites
  const hasMainFile = vercelFiles.some(f => f.file === 'index.html' || f.file === 'package.json');
  if (!hasMainFile) {
    // If no main files, create a simple index.html
    const readmeContent = files['README.md'] || files['readme.md'] || '';
    vercelFiles.push({
      file: 'index.html',
      data: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Repository: ${projectName}</h1>
    <p>This repository has been deployed successfully!</p>
    <p>Source: <a href="${repoUrl}" target="_blank">${repoUrl}</a></p>
    ${readmeContent ? `<h2>README</h2><pre>${readmeContent}</pre>` : ''}
</body>
</html>`
    });
  }

  const deployment = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    files: vercelFiles,
    target: 'production',
    public: false,
    projectSettings: {
      framework: detectFramework(files),
      buildCommand: getBuildCommand(files),
      outputDirectory: getOutputDirectory(files),
      installCommand: getInstallCommand(files)
    }
  };

  console.log('Deploying to Vercel with files:', vercelFiles.map(f => f.file));

  const response = await fetch('https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deployment)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vercel API Error:', response.status, errorText);
    throw new Error(`Vercel deployment failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as any;
  console.log('Vercel deployment created:', {
    url: result.url,
    id: result.id,
    readyState: result.readyState
  });

  return {
    url: `https://${result.url}`,
    deploymentId: result.id,
    readyState: result.readyState,
    alias: result.alias
  };
}

function extractRepoFromUrl(repoUrl: string): string {
  // Extract owner/repo from GitHub URL
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  return match[1].replace('.git', '');
}

function detectFramework(files: { [key: string]: string }): string | null {
  if (files['package.json']) {
    try {
      const packageJson = JSON.parse(files['package.json']);
      
      if (packageJson.dependencies?.['next']) return 'nextjs';
      if (packageJson.dependencies?.['react']) return 'create-react-app';
      if (packageJson.dependencies?.['vue']) return 'vue';
      if (packageJson.dependencies?.['@angular/core']) return 'angular';
      if (packageJson.dependencies?.['svelte']) return 'svelte';
    } catch (e) {
      console.warn('Failed to parse package.json');
    }
  }
  
  if (files['index.html']) return null; // Static site
  
  return null;
}

function getBuildCommand(files: { [key: string]: string }): string | null {
  if (files['package.json']) {
    try {
      const packageJson = JSON.parse(files['package.json']);
      if (packageJson.scripts?.build) return 'npm run build';
      if (packageJson.scripts?.['build-prod']) return 'npm run build-prod';
    } catch (e) {
      console.warn('Failed to parse package.json for build command');
    }
  }
  return null;
}

function getOutputDirectory(files: { [key: string]: string }): string | null {
  if (files['package.json']) {
    try {
      const packageJson = JSON.parse(files['package.json']);
      
      if (packageJson.dependencies?.['next']) return '.next';
      if (packageJson.dependencies?.['react']) return 'build';
      if (packageJson.dependencies?.['vue']) return 'dist';
    } catch (e) {
      console.warn('Failed to parse package.json for output directory');
    }
  }
  
  return null; // Let Vercel auto-detect
}

function getInstallCommand(files: { [key: string]: string }): string | null {
  if (files['package.json']) {
    if (files['yarn.lock']) return 'yarn install';
    if (files['pnpm-lock.yaml']) return 'pnpm install';
    return 'npm install';
  }
  return null;
}

