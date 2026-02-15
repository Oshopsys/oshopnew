import { getGeneralLedger } from "@/app/actions/reports";
import { getChartOfAccounts } from "@/app/actions/accounting";
import GeneralLedgerClient from "./client";
import { Suspense } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function GeneralLedgerPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const today = new Date();

    // Default to current month
    const startDate = params.startDate ? new Date(params.startDate as string) : startOfMonth(today);
    const endDate = params.endDate ? new Date(params.endDate as string) : endOfMonth(today);
    const accountId = params.accountId as string | undefined;

    // Fetch data
    const [ledgerData, accounts] = await Promise.all([
        getGeneralLedger(startDate, endDate, accountId),
        getChartOfAccounts()
    ]);

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">دفتر الأستاذ العام (General Ledger)</h1>
                <p className="text-muted-foreground text-sm">عرض تفصيلي لحركات الحسابات</p>
            </div>

            <Suspense fallback={<div>جاري التحميل...</div>}>
                <GeneralLedgerClient
                    initialData={ledgerData}
                    accounts={accounts || []}
                    defaultStartDate={format(startDate, "yyyy-MM-dd")}
                    defaultEndDate={format(endDate, "yyyy-MM-dd")}
                    defaultAccountId={accountId}
                />
            </Suspense>
        </div>
    );
}
