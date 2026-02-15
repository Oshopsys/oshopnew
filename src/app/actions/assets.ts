'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type Asset = Database['public']['Tables']['assets']['Row'];

// --- Fixed Assets (Tangible) ---

export async function getFixedAssets() {
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'TANGIBLE')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching fixed assets:', error);
        throw new Error('Failed to fetch fixed assets');
    }

    return data;
}

export async function createFixedAsset(asset: any) {
    const { data, error } = await supabase
        .from('assets')
        .insert({
            name: asset.name,
            code: asset.code,
            type: 'TANGIBLE',
            purchase_date: new Date().toISOString(),
            purchase_cost: asset.purchaseCost || asset.acquisitionCost, // handle both prop names if inconsistent
            depreciation_rate: asset.depreciationRate,
            description: asset.description,
            status: 'ACTIVE'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating fixed asset:', error);
        throw new Error('Failed to create fixed asset');
    }
    return data;
}

// --- Intangible Assets ---

export async function getIntangibleAssets() {
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'INTANGIBLE')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching intangible assets:', error);
        throw new Error('Failed to fetch intangible assets');
    }

    return data;
}

export async function createIntangibleAsset(asset: any) {
    const { data, error } = await supabase
        .from('assets')
        .insert({
            name: asset.name,
            code: asset.code,
            type: 'INTANGIBLE',
            purchase_date: new Date().toISOString(),
            purchase_cost: asset.acquisitionCost,
            depreciation_rate: asset.amortizationRate, // Field is shared
            description: asset.description,
            status: 'ACTIVE'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating intangible asset:', error);
        throw new Error('Failed to create intangible asset');
    }
    return data;
}

// --- Depreciation Entries ---

export async function getDepreciationEntries() {
    // Ideally filter by asset type TANGIBLE, but for now fetch all or join to filter
    const { data, error } = await supabase
        .from('depreciation_entries')
        .select(`
            *,
            asset:assets!inner(name, code, type)
        `)
        .eq('asset.type', 'TANGIBLE')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching depreciation entries:', error);
        throw new Error('Failed to fetch depreciation entries');
    }

    return data;
}

export async function createDepreciationEntry(entry: any, lines: any[]) {
    const entriesToInsert = lines.map(line => ({
        asset_id: line.assetId,
        date: entry.date,
        amount: line.amount,
        description: entry.description,
    }));

    const { data, error } = await supabase
        .from('depreciation_entries')
        .insert(entriesToInsert)
        .select();

    if (error) {
        console.error('Error creating depreciation entries:', error);
        throw new Error('Failed to create depreciation entries');
    }

    return data;
}

// --- Amortization Entries (Same table, different asset type) ---

export async function getAmortizationEntries() {
    const { data, error } = await supabase
        .from('depreciation_entries')
        .select(`
            *,
            asset:assets!inner(name, code, type)
        `)
        .eq('asset.type', 'INTANGIBLE')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching amortization entries:', error);
        throw new Error('Failed to fetch amortization entries');
    }

    return data;
}

export async function createAmortizationEntry(entry: any, lines: any[]) {
    // Same logic as depreciation, just logically separated
    const entriesToInsert = lines.map(line => ({
        asset_id: line.assetId,
        date: entry.date,
        amount: line.amount,
        description: entry.description,
    }));

    const { data, error } = await supabase
        .from('depreciation_entries')
        .insert(entriesToInsert)
        .select();

    if (error) {
        console.error('Error creating amortization entries:', error);
        throw new Error('Failed to create amortization entries');
    }

    return data;
}
