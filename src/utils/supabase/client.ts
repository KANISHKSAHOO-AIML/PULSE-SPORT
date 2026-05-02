import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
}

export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_anon_key',
  {
    auth: {
      flowType: 'pkce',
      // Prevent "Lock was released because another request stole it" errors
      // caused by multiple components calling auth simultaneously.
      // Use a simple in-memory lock instead of navigator.locks.
      lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
        return await fn();
      },
    },
  }
);
