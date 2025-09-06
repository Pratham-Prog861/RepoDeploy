import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Deployment {
  id: string;
  repo_url: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  live_url: string | null;
  build_logs: string[];
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Deployment operations
export async function createDeployment(deploymentData: Partial<Deployment>) {
  const { data, error } = await supabase
    .from('deployments')
    .insert([deploymentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDeployment(id: string, updates: Partial<Deployment>) {
  const { data, error } = await supabase
    .from('deployments')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDeployment(id: string) {
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function addBuildLog(id: string, logMessage: string) {
  const deployment = await getDeployment(id);
  const updatedLogs = [...(deployment.build_logs || []), logMessage];
  
  return updateDeployment(id, { build_logs: updatedLogs });
}
