
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple env parser
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
    console.log('--- Inspecting Tables ---');

    // 1. Check Profiles columns
    console.log('\nChecking "profiles" table...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) console.log('Error fetching profiles:', pError.message);
    else if (profiles.length > 0) console.log('Profiles columns:', Object.keys(profiles[0]));
    else console.log('Profiles table empty, cannot infer columns from data.');

    // 2. Check work_logs columns
    console.log('\nChecking "work_logs" table...');
    const { data: logs, error: lError } = await supabase.from('work_logs').select('*').limit(1);
    if (lError) {
        console.log('Error fetching work_logs:', lError.message);
    } else if (logs.length > 0) {
        console.log('Work_logs columns:', Object.keys(logs[0]));
    } else {
        // Use RPC or metadata injection if table exists but empty? 
        // For now, if no error, it exists.
        console.log('Work_logs table exists but is empty.');

        // Try to insert a dummy to see missing column error if possible, 
        // or assume it was created by the previous script partially.
    }
}

inspect();
