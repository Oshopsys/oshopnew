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
    // 1. Create Journal Entry Header
    const { data: newEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
            transaction_date: entry.date,
            reference: entry.reference,
            description: entry.narrative,
            status: 'POSTED' // Auto-post for now as per legacy behavior, or make it DRAFT
        })
        .select()
        .single();

    if (entryError) {
        console.error('Error creating journal entry header:', entryError);
        throw new Error('Failed to create journal entry header: ' + entryError.message);
    }

    // 2. Create Journal Entry Lines
    const lines = entry.lines.map((line: any) => ({
        entry_id: newEntry.id,
        account_id: line.accountId,
        description: line.description,
        debit: line.debit,
        credit: line.credit
    }));

    const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

    if (linesError) {
        console.error('Error creating journal entry lines:', linesError);
        // Ideally we should rollback the header creation here, but Supabase client doesn't support transactions easily without RPC.
        // For now, we'll throw error.
        throw new Error('Failed to create journal entry lines: ' + linesError.message);
    }

    revalidatePath('/journal-entries');
    return newEntry;
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
