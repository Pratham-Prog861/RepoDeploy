export const deploymentConfig = {
  // Set to 'simulation' for demo mode, 'vercel' for real Vercel deployments
  mode: process.env.DEPLOYMENT_MODE || 'simulation',
  
  // Vercel configuration (only used if mode is 'vercel')
  vercel: {
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID
  }
} as const;

export type DeploymentMode = typeof deploymentConfig.mode;

export function isSimulationMode(): boolean {
  return deploymentConfig.mode === 'simulation';
}

export function isRealDeployment(): boolean {
  return deploymentConfig.mode === 'vercel';
}
