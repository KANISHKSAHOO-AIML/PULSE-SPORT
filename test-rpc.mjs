import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rbjgobolymqzbfxfqidb.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamdvYm9seW1xemJmeGZxaWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MTE1MiwiZXhwIjoyMDg5MTY3MTUyfQ.EPj66GVSaUdSvcvgvugcrgWX0KH2qvt71q3RiBjk2GA";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function test() {
  const { data, error } = await supabase.rpc("toggle_comment_like", {
    p_comment_id: "00000000-0000-0000-0000-000000000000"
  });
  console.log("RPC Error:", error);
}

test();
