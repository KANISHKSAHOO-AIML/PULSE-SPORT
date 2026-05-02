import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rbjgobolymqzbfxfqidb.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamdvYm9seW1xemJmeGZxaWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MTE1MiwiZXhwIjoyMDg5MTY3MTUyfQ.EPj66GVSaUdSvcvgvugcrgWX0KH2qvt71q3RiBjk2GA";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function test() {
  const userId = '5a001ee2-6e5f-48e6-948a-0094ea88f0b3'; // The user missing a profile

  console.log("Creating profile for missing user...");
  const { data, error } = await supabase.from("profiles").upsert({
    id: userId,
    username: 'new_fan_user',
    favorite_sport: 'cricket'
  });
  console.log("Profile create result:", error || "Success");

  console.log("Testing insert comment...");
  const { error: cError } = await supabase.from("comments").insert({
    entity_type: "news",
    entity_id: "test",
    user_id: userId,
    content: "Testing"
  });
  console.log("Insert comment result:", cError || "Success");
}

test();
