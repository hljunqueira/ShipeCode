
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../mcp-server/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables. Check .env file in mcp-server.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('--- Initializing Profiles & Triggers ---');

    // 1. Create the Function and Trigger via SQL
    // Note: We cannot execute raw SQL via JS client easily unless we use RPC or have direct access.
    // However, for this environment, we will try to use the MCP Server capability or just instruct the user.
    // Wait, I can use the `mcp-server` to run SQL if I implemented it? No, I only implemented read/search.
    // I don't have a tool to run raw SQL.

    // BUT! I can use the Service Role to insert profiles for existing users.
    // And I can try to define the trigger via the SQL Editor... but I am the agent.

    // Strategy:
    // 1. Fix existing data: Fetch all users from auth, check profiles, insert missing.
    // 2. The trigger is harder to install without direct SQL access. But wait, I have the `database_schema.sql` file.
    // If the user has a way to apply it? Use the `mcp-server` is not for migration.

    // Alternate Plan for Trigger:
    // Since I cannot run DDL (CREATE TRIGGER) via supabase-js client (it only does DML),
    // I must rely on the user or the existing infrastructure. Not ideal.
    // 
    // Wait! I can't enable the trigger via code if I don't have SQL access.
    // However, I can ensure my `create-admin` or manual creation logic ALSO inserts into profiles.
    // That's a workaround.
    //
    // BETRER: I will fix the existing data first.
    // Then I will inform the user what SQL they need to run in Supabase Dashboard.

    // Step 1: Fix Data
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error || !users) {
        console.error('Error listing users:', error);
        return;
    }

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (!profile) {
            console.log(`Creating profile for user: ${user.email} (${user.id})`);

            // Determine Role (Admin for specific email, else Contributor)
            const role = user.email === 'admin@shipcode.com' ? 'ADMIN' : (user.user_metadata?.role || 'CONTRIBUTOR');
            const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                name: name,
                role: role,
                avatar_url: null
            });

            if (insertError) {
                console.error(`Failed to insert profile for ${user.email}:`, insertError.message);
            } else {
                console.log(`Profile created for ${user.email}.`);
            }
        } else {
            console.log(`Profile exists for ${user.email}.`);
        }
    }

    console.log('--- Done ---');
}

main();
