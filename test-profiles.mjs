import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles, pErr);
  
  const { data: thoughts, error: tErr } = await supabase.from('match_thoughts').select('*');
  console.log("Thoughts:", thoughts, tErr);
}
check();
