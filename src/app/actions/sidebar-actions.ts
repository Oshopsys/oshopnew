"use server";

import { supabase } from "@/lib/supabase";

export async function getSidebarCounts() {

    try {
        // Fetch all counts in parallel
        const [
            bankAccountsResult,
            receiptsResult,
            paymentsResult,
            transfersResult,
            customersResult,
            salesInvoicesResult,
            suppliersResult,
            purchaseInvoicesResult,
            inventoryItemsResult,
            productionOrdersResult,
            employeesResult,
            payslipsResult,
            fixedAssetsResult,
            depreciationEntriesResult,
            intangibleAssetsResult,
            amortizationEntriesResult,
            capitalAccountsResult,
            journalEntriesResult,
        ] = await Promise.all([
            supabase.from("bank_accounts").select("id", { count: "exact", head: true }),
            supabase.from("receipts").select("id", { count: "exact", head: true }),
            supabase.from("payments").select("id", { count: "exact", head: true }),
            supabase.from("transfers").select("id", { count: "exact", head: true }),
            supabase.from("partners").select("id", { count: "exact", head: true }).eq("type", "CUSTOMER"),
            supabase.from("invoices").select("id", { count: "exact", head: true }).eq("type", "SALE"),
            supabase.from("partners").select("id", { count: "exact", head: true }).eq("type", "SUPPLIER"),
            supabase.from("invoices").select("id", { count: "exact", head: true }).eq("type", "PURCHASE"),
            supabase.from("inventory_items").select("id", { count: "exact", head: true }),
            supabase.from("production_orders").select("id", { count: "exact", head: true }),
            supabase.from("employees").select("id", { count: "exact", head: true }),
            supabase.from("payslips").select("id", { count: "exact", head: true }),
            supabase.from("fixed_assets").select("id", { count: "exact", head: true }),
            supabase.from("depreciation_entries").select("id", { count: "exact", head: true }),
            supabase.from("intangible_assets").select("id", { count: "exact", head: true }),
            supabase.from("amortization_entries").select("id", { count: "exact", head: true }),
            supabase.from("capital_accounts").select("id", { count: "exact", head: true }),
            supabase.from("journal_entries").select("id", { count: "exact", head: true }),
        ]);

        return {
            "/bank-accounts": bankAccountsResult.count ?? 0,
            "/receipts": receiptsResult.count ?? 0,
            "/payments": paymentsResult.count ?? 0,
            "/inter-account-transfers": transfersResult.count ?? 0,
            "/customers": customersResult.count ?? 0,
            "/sales-invoices": salesInvoicesResult.count ?? 0,
            "/suppliers": suppliersResult.count ?? 0,
            "/purchase-invoices": purchaseInvoicesResult.count ?? 0,
            "/inventory-items": inventoryItemsResult.count ?? 0,
            "/production-orders": productionOrdersResult.count ?? 0,
            "/employees": employeesResult.count ?? 0,
            "/payslips": payslipsResult.count ?? 0,
            "/fixed-assets": fixedAssetsResult.count ?? 0,
            "/depreciation-entries": depreciationEntriesResult.count ?? 0,
            "/intangible-assets": intangibleAssetsResult.count ?? 0,
            "/amortization-entries": amortizationEntriesResult.count ?? 0,
            "/capital-accounts": capitalAccountsResult.count ?? 0,
            "/journal-entries": journalEntriesResult.count ?? 0,
        };
    } catch (error) {
        console.error("Error fetching sidebar counts:", error);
        // Return zeros on error
        return {
            "/bank-accounts": 0,
            "/receipts": 0,
            "/payments": 0,
            "/inter-account-transfers": 0,
            "/customers": 0,
            "/sales-invoices": 0,
            "/suppliers": 0,
            "/purchase-invoices": 0,
            "/inventory-items": 0,
            "/production-orders": 0,
            "/employees": 0,
            "/payslips": 0,
            "/fixed-assets": 0,
            "/depreciation-entries": 0,
            "/intangible-assets": 0,
            "/amortization-entries": 0,
            "/capital-accounts": 0,
            "/journal-entries": 0,
        };
    }
}
