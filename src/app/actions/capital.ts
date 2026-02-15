'use server'

import { supabase } from '@/lib/supabase';

export async function getCapitalAccounts() {
    const { data, error } = await supabase
        .from('capital_accounts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching capital accounts:', error);
        // If table doesn't exist yet (migration pending), return empty to avoid crash
        if (error.code === '42P01') return [];
        throw new Error('Failed to fetch capital accounts');
    }

    return data;
}

export async function createCapitalAccount(data: any) {
    const { data: result, error } = await supabase
        .from('capital_accounts')
        .insert({
            name: data.name,
            code: data.code,
            initial_balance: data.initialBalance,
            description: data.description // if added to form
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating capital account:', error);
        throw new Error('Failed to create capital account');
    }

    return result;
}
