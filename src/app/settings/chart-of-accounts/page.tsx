import { getChartOfAccounts } from "@/app/actions/accounting";
import ChartOfAccountsClient from "./client";

export default async function ChartOfAccountsPage() {
    const accounts = await getChartOfAccounts();

    return (
        <ChartOfAccountsClient accounts={accounts || []} />
    );
}
