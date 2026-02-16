'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

import { revalidatePath } from 'next/cache';

export type Partner = Database['public']['Tables']['partners']['Row'];
export type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
export type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

export async function getPartners(type?: 'CUSTOMER' | 'SUPPLIER') {
    let query = supabase
        .from('partners')
        .select('*')
        .order('name');

    if (type) {
        query = query.eq('type', type);
    } else {
        query = query.in('type', ['CUSTOMER', 'BOTH']);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching partners:', error);
        throw new Error('Failed to fetch partners');
    }

    return data;
    return data;
}

export async function getCustomers() {
    return getPartners('CUSTOMER');
}

export async function getSuppliers() {
    return getPartners('SUPPLIER');
}

export async function getPartner(id: string) {
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching partner:', error);
        return null;
    }

    return data;
}

export async function createPartner(partner: any) {
    // Map form fields to DB columns
    const payload = {
        name: partner.name,
        code: partner.code,
        type: partner.type || 'CUSTOMER', // Default to CUSTOMER if not provided
        email: partner.email || null,
        address: partner.billingAddress, // Use billing address as main address
        tax_number: partner.taxIdentificationNumber || null,
        is_active: true,
        // TODO: Add credit_limit and currency to schema if needed, currently not in partners table
        // For now we store basic info
    };

    const { data, error } = await supabase
        .from('partners')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error creating partner:', error);
        throw new Error('Failed to create partner');
    }

    revalidatePath('/suppliers');
    revalidatePath('/customers');
    return data;
}

export async function updatePartner(id: string, partner: any) {
    const payload = {
        name: partner.name,
        code: partner.code,
        email: partner.email || null,
        address: partner.billingAddress,
        tax_number: partner.taxIdentificationNumber || null,
    };

    const { data, error } = await supabase
        .from('partners')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating partner:', error);
        throw new Error('Failed to update partner');
    }
    return data;
}
