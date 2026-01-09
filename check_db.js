
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(url, key);

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
