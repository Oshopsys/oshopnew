import { getTrialBalance } from "@/app/actions/reports";
import TrialBalanceClient from "./client";
import { Suspense } from "react";
import { format } from "date-fns";

export default async function TrialBalancePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const today = new Date();

    // Default to today
    const date = params.date ? new Date(params.date as string) : today;

    // Fetch data
    const trialBalanceData = await getTrialBalance(date);

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">ميزان المراجعة (Trial Balance)</h1>
                <p className="text-muted-foreground text-sm">عرض أرصدة جميع الحسابات في تاريخ معين</p>
            </div>

            <Suspense fallback={<div>جاري التحميل...</div>}>
                <TrialBalanceClient
                    initialData={trialBalanceData}
                    defaultDate={format(date, "yyyy-MM-dd")}
                />
            </Suspense>
        </div>
    );
}
