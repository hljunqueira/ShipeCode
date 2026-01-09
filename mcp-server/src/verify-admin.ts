
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../mcp-server/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- Verifying Admin Profile ---');

    // 1. Get User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const admin = users?.find(u => u.email === 'admin@shipcode.com');

    if (!admin) {
        console.error('Admin user NOT FOUND in Auth!');
        return;
    }

    console.log(`Admin Auth ID: ${admin.id}`);

    // 2. Check Profile (Service Role)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', admin.id)
        .single();

    if (error) {
        console.error('Error fetching profile (Service Role):', error);
    } else {
        console.log('Profile found (Service Role):', profile);
    }

    // 3. Check RLS policies? (Can't easily via client)
}

main();
