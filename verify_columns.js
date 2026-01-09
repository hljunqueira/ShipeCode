// verify_columns.js - Check which tables have organization_id
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
    console.log('🔍 Verificando colunas organization_id nas tabelas...\n');

    const tables = ['leads', 'projects', 'tasks', 'financial_items', 'work_logs', 'profiles'];

    for (const table of tables) {
        try {
            // Try to select organization_id - if column doesn't exist, Supabase returns error
            const { data, error } = await supabase
                .from(table)
                .select('organization_id')
                .limit(1);

            if (error && error.message.includes('does not exist')) {
                console.log(`❌ ${table}: NÃO tem organization_id`);
            } else if (error) {
                console.log(`⚠️  ${table}: Erro - ${error.message}`);
            } else {
                console.log(`✅ ${table}: TEM organization_id`);
            }
        } catch (e) {
            console.log(`⚠️  ${table}: Erro - ${e.message}`);
        }
    }

    console.log('\n📋 Verificação concluída!');
}

checkColumns();
