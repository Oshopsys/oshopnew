'use server'

import { supabase } from '@/lib/supabase';

export async function getProductionOrders() {
    const { data, error } = await supabase
        .from('production_orders')
        .select(`
            *,
            inventory_item:inventory_items(name, code)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching production orders:', error);
        // Return empty if table doesn't exist yet to prevent crash
        if (error.code === '42P01') return [];
        throw new Error('Failed to fetch production orders');
    }

    return data;
}

export async function createProductionOrder(data: any) {
    const { data: result, error } = await supabase
        .from('production_orders')
        .insert({
            reference: data.reference,
            date: data.date,
            finished_product_id: data.finishedProductId,
            quantity: data.quantity,
            status: data.status || 'DRAFT',
            description: data.description
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating production order:', error);
        throw new Error('Failed to create production order');
    }

    return result;
}
