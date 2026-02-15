'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

export async function getJournalEntries() {
    const { data, error } = await supabase
        .from('journal_entries')
        .select(`
      *,
      lines:journal_entry_lines(*)
    `)
        .order('transaction_date', { ascending: false });

    if (error) {
        console.error('Error fetching journal entries:', error);
        throw new Error('Failed to fetch journal entries');
    }

    return data;
}

export async function createJournalEntry(entry: any) {
    // This will be implemented in the next step
    // Requires transaction logic
}

export async function deleteJournalEntry(id: string) {
    // Check if journal entry is posted
    const { data: entry, error: fetchError } = await supabase
        .from('journal_entries')
        .select('status')
        .eq('id', id)
        .single();

    if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch journal entry');
    }

    if (entry.status === 'POSTED') {
        throw new Error('Cannot delete a posted record. Unpost it first.');
    }

    const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting journal entry:', error);
        throw new Error(error.message || 'Failed to delete journal entry');
    }

    revalidatePath('/journal-entries');
    return { success: true };
}
