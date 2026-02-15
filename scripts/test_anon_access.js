const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAccess() {
    console.log('Testing Anon Access to Inventory Items...');

    // Try Insert
    const newItem = {
        name: 'Script Item ' + Date.now(),
        code: 'SCRIPT-' + Date.now(),
        sales_price: 100,
        cost_price: 0
    };
    const { data: insertData, error: insertError } = await supabase.from('inventory_items').insert(newItem).select().single();
    if (insertError) {
        console.error('Insert Failed:', insertError);
    } else {
        console.log('Insert Success:', insertData.id);
    }

    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Found items:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

testAccess();
