'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];

export async function getBankAccounts() {
    const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching bank accounts:', error);
        throw new Error('Failed to fetch bank accounts');
    }

    return data;
}

export async function createBankAccount(account: Database['public']['Tables']['bank_accounts']['Insert']) {
    const { data, error } = await supabase
        .from('bank_accounts')
        .insert(account)
        .select()
        .single();

    if (error) {
        console.error('Error creating bank account:', error);
        throw new Error('Failed to create bank account');
    }
    return data;
}

export async function getPayments() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            bank_account:bank_accounts(name),
            partner:partners(name)
        `)
        .eq('type', 'PAYMENT')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching payments:', error);
        throw new Error('Failed to fetch payments');
    }
    return data;
}

export async function getReceipts() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            bank_account:bank_accounts(name),
            partner:partners(name)
        `)
        .eq('type', 'RECEIPT')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching receipts:', error);
        throw new Error('Failed to fetch receipts');
    }
    return data;
}

export async function getTransfers() {
    // We need to fetch details. Since 'payments' table stores 'TRANSFER' type.
    // However, the payment record only links to ONE bank account (the 'From' or 'To' depending on implementation).
    // In our `create_transfer_transaction` logic, we stored the 'From' account in `bank_account_id`.
    // The 'To' account info is buried in the journal entry lines description or we need to find the related line.
    // For a robust implementation, we should have stored `to_account_id` in `payments` or a separate table.
    // BUT, for now, let's just fetch what we have. 
    // Ideally, we should update the `payments` schema or `measury_transfers` table.
    // Given the constraints and the `create_transfer_transaction` implementation:
    // We can infer the 'To' account from the Journal Entry lines if needed, but that's complex to fetch in one go efficiently without proper relations.
    // Let's rely on `payments` table for the main list and maybe description has info.

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            bank_account:bank_accounts(name)
        `)
        .eq('type', 'TRANSFER')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transfers:', error);
        throw new Error('Failed to fetch transfers');
    }
    return data;
}

export async function createPayment(data: any, lines: any[]) {
    // Requires 'create_treasury_transaction' RPC to be deployed
    const { data: result, error } = await supabase.rpc('create_treasury_transaction', {
        p_type: 'PAYMENT',
        p_date: data.date,
        p_bank_account_id: data.bank_account_id, // paidFromAccountId maps to this
        p_partner_id: data.partner_id || null,     // payeeId maps to this
        p_reference: data.reference || '',
        p_description: data.description || '',
        p_amount: data.amount,
        p_lines: lines
    });

    if (error) {
        console.error('Error creating payment:', error);
        throw new Error('Failed to create payment: ' + error.message);
    }
    return result;
}

export async function createReceipt(data: any, lines: any[]) {
    // Requires 'create_treasury_transaction' RPC to be deployed
    const { data: result, error } = await supabase.rpc('create_treasury_transaction', {
        p_type: 'RECEIPT',
        p_date: data.date,
        p_bank_account_id: data.bank_account_id, // receivedInAccountId
        p_partner_id: data.partner_id || null,     // payerId
        p_reference: data.reference || '',
        p_description: data.description || '',
        p_amount: data.amount,
        p_lines: lines
    });

    if (error) {
        console.error('Error creating receipt:', error);
        throw new Error('Failed to create receipt: ' + error.message);
    }
    return result;
}

export async function createTransfer(data: any) {
    // Requires 'create_transfer_transaction' RPC to be deployed
    const { data: result, error } = await supabase.rpc('create_transfer_transaction', {
        p_date: data.date,
        p_from_account_id: data.fromAccountId,
        p_to_account_id: data.toAccountId,
        p_reference: data.reference || '',
        p_description: data.description || '',
        p_amount: data.amount
    });

    if (error) {
        console.error('Error creating transfer:', error);
        throw new Error('Failed to create transfer: ' + error.message);
    }
    return result;
}

export async function getBankAccount(id: string) {
    const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching bank account:', error);
        throw new Error('Failed to fetch bank account');
    }
    return data;
}

export async function updateBankAccount(id: string, account: Database['public']['Tables']['bank_accounts']['Update']) {
    const { data, error } = await supabase
        .from('bank_accounts')
        .update(account)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating bank account:', error);
        throw new Error('Failed to update bank account');
    }
    return data;
}

export async function getPaymentById(id: string) {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            bank_account:bank_accounts(id, name),
            partner:partners(id, name)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching payment:', error);
        return null;
    }
    return data;
}

export async function deleteReceipt(receiptId: string) {
    const { data, error } = await supabase.rpc('delete_receipt_rpc', {
        p_receipt_id: receiptId
    });

    if (error) {
        console.error('Error deleting receipt:', error);
        throw new Error(error.message || 'Failed to delete receipt');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete receipt');
    }

    return data;
}

export async function deletePayment(paymentId: string) {
    const { data, error } = await supabase.rpc('delete_payment_rpc', {
        p_payment_id: paymentId
    });

    if (error) {
        console.error('Error deleting payment:', error);
        throw new Error(error.message || 'Failed to delete payment');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete payment');
    }

    return data;
}

export async function deleteTransfer(transferId: string) {
    const { data, error } = await supabase.rpc('delete_transfer_rpc', {
        p_transfer_id: transferId
    });

    if (error) {
        console.error('Error deleting transfer:', error);
        throw new Error(error.message || 'Failed to delete transfer');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete transfer');
    }

    return data;
}
