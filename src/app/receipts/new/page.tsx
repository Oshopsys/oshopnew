
import ReceiptForm from "@/components/forms/receipt-form";
import { getBankAccounts } from "@/app/actions/treasury";
import { getCustomers } from "@/app/actions/partners";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function NewReceiptPage() {
    const bankAccounts = await getBankAccounts() || [];
    const customers = await getCustomers() || [];
    const accounts = await getChartOfAccounts() || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <ReceiptForm
                mode="create"
                bankAccounts={bankAccounts}
                customers={customers}
                accounts={accounts}
            />
        </div>
    );
}
