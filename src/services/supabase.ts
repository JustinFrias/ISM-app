import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://orsgxwtpxpcaxbpzsvrp.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yc2d4d3RweHBjYXhicHpzdnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDYxODgsImV4cCI6MjEwMzgyMjE4OH0.r_Ixa6H2ixgNzfupjwi5HIGdtPqYTZ3QxL6StCgcI7I';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Health check helper to verify Supabase connectivity
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment variables (Using local storage mode).',
    };
  }

  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    return {
      connected: true,
      message: 'Connected to Supabase PostgreSQL database successfully.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Supabase connection failed: ${err.message || err}`,
    };
  }
}
