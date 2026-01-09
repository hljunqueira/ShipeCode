
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Load client env

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    console.log('--- Testing Anon Access ---');

    // 1. Login
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@shipcode.com',
        password: process.argv[2] || '183834@Hlj'
    });

    if (loginError || !data.session) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('Login successful. Token:', data.session.access_token.substring(0, 20) + '...');

    // 2. Try to fetch Profile
    console.log('Fetching Profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    } else {
        console.log('Profile found:', profile);
    }

    // 3. Try to fetch Organization (This caused 406 before)
    console.log('Fetching Organization...');
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .single();

    if (orgError) {
        console.error('Error fetching organization:', orgError);
        console.log('--> RLS improperly configured if this fails but org exists.');
    } else {
        console.log('Organization found:', org);
    }
}

main();
