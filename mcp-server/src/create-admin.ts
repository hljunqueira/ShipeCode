
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
    const email = 'admin@shipcode.com';
    const password = '183834@Hlj';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            role: 'ADMIN',
            name: 'Admin ShipCode'
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        // If user already exists, we might want to update the password or just log it
        if (error.message.includes('already registered')) {
            console.log("User already exists. Skipping creation.");
            return;
        }
    } else {
        console.log('User created successfully:', data.user.id);

        // Ensure profile exists (trigger might handle it, but redundant check helps)
        // actually database trigger handle_new_user should have created the profile
        // Let's verify via MCP later
    }
}

createAdmin();
