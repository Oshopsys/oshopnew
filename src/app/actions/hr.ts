'use server'

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type Employee = Database['public']['Tables']['employees']['Row'];

export async function getEmployees() {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching employees:', error);
        throw new Error('Failed to fetch employees');
    }

    return data;
}

export async function createEmployee(employee: Database['public']['Tables']['employees']['Insert']) {
    const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

    if (error) {
        console.error('Error creating employee:', error);
        throw new Error('Failed to create employee');
    }
    return data;
}

export async function getEmployee(id: string) {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching employee:', error);
        throw new Error('Failed to fetch employee');
    }
    return data;
}

export async function updateEmployee(id: string, employee: Database['public']['Tables']['employees']['Update']) {
    const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating employee:', error);
        throw new Error('Failed to update employee');
    }
    return data;
}
