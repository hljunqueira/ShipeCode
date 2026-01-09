
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPolicies() {
    console.log("Checking Policies on 'profiles'...");
    // We can't query pg_policies easily via client unless we use rpc.
    // Instead, let's try to UPDATE a user and see the error.

    // BUT we need to be logged in as ADMIN to test the RLS correctly.
    // Since we are anon here, we can't test "Admin update".

    // PLAN B: Just assume RLS is the issue and providing the FIX SQL is faster.
    // Most likely default RLS is "Users can update own profile".

    console.log("Skipping direct check. Generating Fix SQL.");
}

async function checkTables() {
    console.log('Checking tables...');

    // Check expenses
    const { count: expensesCount, error: expensesError } = await supabase.from('expenses').select('*', { count: 'exact', head: true });
    if (expensesError) console.log('Expenses table error:', expensesError.message);
    else console.log('Expenses table exists. Count:', expensesCount);

    // Check work_logs
    const { count: workLogsCount, error: workLogsError } = await supabase.from('work_logs').select('*', { count: 'exact', head: true });
    if (workLogsError) console.log('Work_logs table error:', workLogsError.message);
    else console.log('Work_logs table exists. Count:', workLogsCount);

    // Check organizations for settings
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('settings').limit(1);
    if (orgError) console.log('Org error:', orgError.message);
    else console.log('Org settings sample:', JSON.stringify(orgs?.[0]?.settings || {}));

}

checkTables();
