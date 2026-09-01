import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
