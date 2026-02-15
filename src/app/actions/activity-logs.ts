'use server'

import { supabase } from '@/lib/supabase';

export type ActivityLogAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type ActivityLogEntityType =
    | 'inventory_item'
    | 'bank_account'
    | 'employee'
    | 'partner';

export interface ActivityLog {
    id: string;
    entity_type: ActivityLogEntityType;
    entity_id: string;
    entity_name: string | null;
    action: ActivityLogAction;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    user_id: string | null;
    user_name: string | null;
    ip_address: string | null;
    created_at: string;
}

export interface ActivityLogFilters {
    entityType?: ActivityLogEntityType;
    entityId?: string;
    action?: ActivityLogAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
}

/**
 * Get activity logs with optional filters
 */
export async function getActivityLogs(filters?: ActivityLogFilters) {
    let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
    }

    if (filters?.action) {
        query = query.eq('action', filters.action);
    }

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    } else {
        query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching activity logs:', error);
        throw new Error(error.message || 'Failed to fetch activity logs');
    }

    return data as ActivityLog[];
}

/**
 * Get activity logs for a specific entity
 */
export async function getEntityLogs(
    entityType: ActivityLogEntityType,
    entityId: string,
    limit: number = 50
) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching entity logs:', error);
        throw new Error(error.message || 'Failed to fetch entity logs');
    }

    return data as ActivityLog[];
}

/**
 * Get recent activity logs (last N records)
 */
export async function getRecentLogs(limit: number = 20) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent logs:', error);
        throw new Error(error.message || 'Failed to fetch recent logs');
    }

    return data as ActivityLog[];
}

/**
 * Get activity statistics
 */
export async function getActivityStats() {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('entity_type, action');

    if (error) {
        console.error('Error fetching activity stats:', error);
        throw new Error(error.message || 'Failed to fetch activity stats');
    }

    // Aggregate stats
    const stats = {
        total: data.length,
        byEntityType: {} as Record<string, number>,
        byAction: {} as Record<string, number>,
    };

    data.forEach((log) => {
        stats.byEntityType[log.entity_type] = (stats.byEntityType[log.entity_type] || 0) + 1;
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    });

    return stats;
}
