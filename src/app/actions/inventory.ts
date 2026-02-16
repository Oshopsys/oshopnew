// 'use server' removed to fix build error

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

export async function getInventoryItems() {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching inventory items:', error);
        throw new Error('Failed to fetch inventory items');
    }

    return data;
}

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
    return data;
}

export async function getInventoryItem(id: string) {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching inventory item:', error);
        throw new Error('Failed to fetch inventory item');
    }
    return data;
}
