'use server'
// @ts-nocheck

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type Invoice = Database['public']['Tables']['invoices']['Row'] & {
    partner?: { name: string } | null;
    lines?: (Database['public']['Tables']['invoice_lines']['Row'] & {
        item?: { name: string; code: string } | null;
    })[];
};

export async function getInvoices(type: 'SALE' | 'PURCHASE') {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
        *,
        partner:partners(name)
    `)
        .eq('type', type)
        .order('date', { ascending: false });

    if (error) {
        console.error(`Error fetching ${type} invoices:`, error);
        throw new Error(`Failed to fetch ${type} invoices`);
    }

    return data;
}

export async function getInvoice(id: string) {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            partner:partners(*),
            lines:invoice_lines(
                *,
                item:inventory_items(name, code)
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching invoice:', error);
        throw new Error('Failed to fetch invoice');
    }

    return data;
}

export async function approveInvoice(invoiceId: string) {
    // Call the RPC to approve the invoice
    const { data, error } = await supabase.rpc('approve_invoice_rpc', {
        p_invoice_id: invoiceId
    });

    if (error) {
        console.error('Error approving invoice:', error);
        throw new Error(error.message || 'Failed to approve invoice');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Failed to approve invoice');
    }

    return data;
}

export async function deleteInvoice(invoiceId: string) {
    // Call the RPC to delete the invoice and all related data
    const { data, error } = await supabase.rpc('delete_invoice_rpc', {
        p_invoice_id: invoiceId
    });

    if (error) {
        console.error('Error deleting invoice:', error);
        throw new Error(error.message || 'Failed to delete invoice');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete invoice');
    }

    return data;
}

export async function createInvoice(invoice: any, lines: any[]) {
    const { data, error } = await supabase.rpc('create_invoice_rpc', {
        p_type: invoice.type,
        p_date: invoice.date,
        p_partner_id: invoice.partner_id,
        p_invoice_number: invoice.invoice_number,
        p_reference: invoice.reference || '',
        p_description: invoice.description || '',
        p_total: invoice.total,
        p_lines: lines
    });

    if (error) {
        console.error('Error creating invoice:', error);
        throw new Error(error.message || 'Failed to create invoice');
    }

    return data;
}

export async function updateInvoice(id: string, invoice: any, lines: any[]) {
    // 1. Update Invoice Header
    const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
            date: invoice.date,
            partner_id: invoice.partner_id,
            invoice_number: invoice.invoice_number,
            reference: invoice.reference,
            description: invoice.description,
            total: invoice.total
        })
        .eq('id', id)
        .select()
        .single();

    if (invoiceError) throw new Error('Failed to update invoice header: ' + invoiceError.message);

    // 2. Delete existing lines
    const { error: deleteError } = await supabase
        .from('invoice_lines')
        .delete()
        .eq('invoice_id', id);

    if (deleteError) throw new Error('Failed to delete old invoice lines');

    // 3. Create New Lines
    const linesWithid = lines.map(line => ({
        ...line,
        invoice_id: id
    }));

    const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(linesWithid);

    if (linesError) {
        console.error("Error creating new lines", linesError);
        throw new Error('Failed to create new invoice lines');
    }

    return updatedInvoice;
}
// Unpost an invoice (change status from POSTED/APPROVED to DRAFT)
// Also unposts related journal entries
export async function unpostInvoice(id: string) {
    // First, get the invoice to find its number
    const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching invoice:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch invoice');
    }

    // Then, unpost the invoice
    const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'DRAFT' })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error unposting invoice:', error);
        throw new Error(error.message || 'Failed to unpost invoice');
    }

    // Finally, unpost all related journal entries
    // Journal entries are linked via the 'reference' column containing invoice_number
    const { error: journalError } = await supabase
        .from('journal_entries')
        .update({ status: 'DRAFT' })
        .eq('reference', invoice.invoice_number);

    if (journalError) {
        console.error('Error unposting related journal entries:', journalError);
        // Continue even if journal unpost fails, as the invoice is already unposted
    }

    return data;
}


