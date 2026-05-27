const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xlckszgsuydgecemypsc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY2tzemdzdXlkZ2VjZW15cHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjc3MjQsImV4cCI6MjA5Mzc0MzcyNH0.ITLjetIH3w0WAOXN30KkKIk6PQohw0ApJht1Q5BDxG4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Connecting and querying Supabase at:", supabaseUrl);
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('clinics').select('count');
    const duration = Date.now() - start;
    
    if (error) {
      console.error("Supabase Query Error:", error);
    } else {
      console.log(`Success! Response received in ${duration}ms`);
      console.log("Data:", data);
    }
  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

testConnection();
