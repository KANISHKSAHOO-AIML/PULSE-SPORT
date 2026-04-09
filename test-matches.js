import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  console.log("Testing matches fetch...");
  const { data, error } = await supabase.from('matches').select('*');
  console.log("Matches:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
