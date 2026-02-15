'use server'

import { supabase } from '@/lib/supabase';

export async function getChartOfAccounts() {
    const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code');

    if (error) {
        console.error('Error fetching chart of accounts:', error);
        throw new Error('Failed to fetch chart of accounts');
    }

    return data;
}

export async function createAccount(account: any) {
    const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert(account)
        .select()
        .single();

    if (error) {
        console.error('Error creating account:', error);
        throw new Error('Failed to create account');
    }
    return data;
}

export async function updateAccount(id: string, account: any) {
    const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(account)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating account:', error);
        throw new Error('Failed to update account');
    }
    return data;
}

export async function deleteAccount(id: string) {
    const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting account:', error);
        throw new Error('Failed to delete account');
    }
    return true;
}

// Unpost a journal entry (change status from POSTED to DRAFT)
export async function unpostJournalEntry(id: string) {
    const { data, error } = await supabase
        .from('journal_entries')
        .update({ status: 'DRAFT' })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error unposting journal entry:', error);
        throw new Error(error.message || 'Failed to unpost journal entry');
    }

    return data;
}
