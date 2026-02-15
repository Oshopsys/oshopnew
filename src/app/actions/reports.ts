'use server'

import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export async function getAccountBalances(startDate: Date, endDate: Date) {
    const formattedStart = format(startDate, 'yyyy-MM-dd');
    const formattedEnd = format(endDate, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('get_account_balances', {
        p_start_date: formattedStart,
        p_end_date: formattedEnd
    });

    if (error) {
        console.error('Error fetching account balances:', error);
        // Fallback for empty DB or missing RPC
        if (error.code === '42883' || error.code === '42P01') {
            console.warn('RPC get_account_balances missing or table missing. Returning empty.');
            return [];
        }
        throw new Error('Failed to fetch account balances');
    }

    return data || [];
}

export async function getDashboardSummary() {
    const today = new Date();
    // For Balance Sheet items (Assets, Liabilities, Equity), we technically need distinct logic (running balance usually).
    // But `get_account_balances` calculates net movement in period.
    // For a real system, Balance sheet accounts need opening balance + period movement.
    // Given our simple schema, `update_account_balance` trigger updates `balance` column in `chart_of_accounts`.
    // So for Balance Sheet, we should query `chart_of_accounts` directly for current balance.
    // For P&L (Income/Expense), we need period movement (e.g., this month or this year).

    // 1. Get Current Balances for Balance Sheet (Assets, Liabilities, Equity)
    const { data: coaData, error: coaError } = await supabase
        .from('chart_of_accounts')
        .select('*');

    if (coaError) {
        console.error('Error fetching COA:', coaError);
        return null;
    }

    const assets = coaData.filter(a => a.type === 'ASSET');
    const liabilities = coaData.filter(a => a.type === 'LIABILITY');
    const equity = coaData.filter(a => a.type === 'EQUITY');

    const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalEquity = equity.reduce((sum, a) => sum + (a.balance || 0), 0);

    // 2. Get P&L for Current Year
    const startYear = startOfYear(today);
    const endYear = endOfYear(today);

    // We can use the RPC for P&L to get movement over the year
    const pnlData = await getAccountBalances(startYear, endYear);

    const revenues = pnlData.filter((a: any) => a.account_type === 'REVENUE');
    const expenses = pnlData.filter((a: any) => a.account_type === 'EXPENSE');

    // RPC returns 'net_balance' which handles debit/credit logic (Revenue Credit is positive)
    const totalRevenue = revenues.reduce((sum: number, a: any) => sum + Number(a.net_balance), 0);
    const totalExpenses = expenses.reduce((sum: number, a: any) => sum + Number(a.net_balance), 0);

    // Cost of Goods Sold is usually an Expense type but grouped differently. 
    // For simplicity, let's treat all Expenses as totalExpenses for now, or filter by group if we had that detail in the RPC.
    // The RPC returns account_name, so we could filter if needed.

    const netProfit = totalRevenue - totalExpenses;

    // Adjusted Equity needs to include Net Profit of current year if not yet closed
    const adjustedEquity = totalEquity + netProfit;

    return {
        balanceSheet: {
            assets: assets.map(a => ({ name: a.name, balance: a.balance || 0 })),
            liabilities: liabilities.map(l => ({ name: l.name, balance: l.balance || 0 })),
            equity: equity.map(e => ({ name: e.name, balance: e.balance || 0 })),
            totalAssets,
            totalLiabilities,
            totalEquity: adjustedEquity, // Include current year profit
            bsIsBalanced: Math.abs(totalAssets - (totalLiabilities + adjustedEquity)) < 0.1
        },
        incomeStatement: {
            revenue: totalRevenue,
            expenses: totalExpenses,
            netProfit: netProfit
        }
    };
}

export async function getGeneralLedger(startDate: Date, endDate: Date, accountId?: string) {
    const formattedStart = format(startDate, 'yyyy-MM-dd');
    const formattedEnd = format(endDate, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('get_general_ledger', {
        p_start_date: formattedStart,
        p_end_date: formattedEnd,
        p_account_id: (accountId && accountId !== 'all') ? accountId : null
    });

    if (error) {
        console.error('Error fetching general ledger:', error);
        throw new Error('Failed to fetch general ledger');
    }

    return data || [];
}

export async function getTrialBalance(date: Date) {
    const formattedDate = format(date, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('get_trial_balance', {
        p_date: formattedDate
    });

    if (error) {
        console.error('Error fetching trial balance:', error);
        throw new Error('Failed to fetch trial balance');
    }

    return data || [];
}
