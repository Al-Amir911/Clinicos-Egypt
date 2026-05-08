import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies'); // This might not exist
  console.log(data, error);
}

// Or just try to update and see the raw response
async function testUpdate() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log("User:", user?.id);
}
