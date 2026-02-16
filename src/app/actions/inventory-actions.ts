'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function createInventoryItem(item: Database['public']['Tables']['inventory_items']['Insert']) {
    const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();

    if (error) {
        console.error('Error creating inventory item:', error);
        throw new Error('Failed to create inventory item');
    }

    revalidatePath('/inventory-items');
    return data;
}

export async function updateInventoryItem(id: string, item: Database['public']['Tables']['inventory_items']['Update']) {
    const { data, error } = await supabase
        .from('inventory_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating inventory item:', error);
        throw new Error('Failed to update inventory item');
    }

    revalidatePath('/inventory-items');
    return data;
}
