import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rbjgobolymqzbfxfqidb.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamdvYm9seW1xemJmeGZxaWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MTE1MiwiZXhwIjoyMDg5MTY3MTUyfQ.EPj66GVSaUdSvcvgvugcrgWX0KH2qvt71q3RiBjk2GA";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixAllProfiles() {
  console.log("Fetching all auth users...");
  const { data: authUsers, error: aError } = await supabase.auth.admin.listUsers();
  if (aError) {
    console.error("Error fetching users:", aError);
    return;
  }

  const { data: profiles, error: pError } = await supabase.from("profiles").select("id");
  const profileIds = new Set(profiles?.map(p => p.id) || []);

  for (const user of authUsers.users) {
    if (!profileIds.has(user.id)) {
      console.log(`User ${user.id} (${user.email}) is missing a profile. Creating...`);
      const username = user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.slice(0,5)}`;
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username,
        favorite_sport: 'cricket'
      });
      console.log(`-> Result:`, error || "Success");
    } else {
      console.log(`User ${user.id} already has a profile.`);
    }
  }
}

fixAllProfiles();
