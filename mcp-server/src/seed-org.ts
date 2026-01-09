
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../mcp-server/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- Seeding Organization ---');

    // 1. Check if organization exists
    const { data: existingOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();

    if (existingOrg) {
        console.log('Organization already exists:', existingOrg);
        return;
    }

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "JSON object requested, multiple (or no) rows returned"
        console.error('Error fetching organization:', fetchError);
    }

    console.log('No organization found. Creating one...');

    // 2. Create Organization
    const { data: newOrg, error: insertError } = await supabase
        .from('organizations')
        .insert({
            name: 'ShipeCode Agency',
            primary_color: '#dc2626',
            settings: { taxRate: 0.15, currency: 'BRL' }
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error creating organization:', insertError);
    } else {
        console.log('Organization created successfully:', newOrg);
    }
}

main();
