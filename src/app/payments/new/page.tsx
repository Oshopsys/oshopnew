
import PaymentForm from "@/components/forms/payment-form";
import { getBankAccounts } from "@/app/actions/treasury";
import { getSuppliers } from "@/app/actions/partners";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function NewPaymentPage() {
    const bankAccounts = await getBankAccounts() || [];
    const suppliers = await getSuppliers() || [];
    const accounts = await getChartOfAccounts() || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PaymentForm
                mode="create"
                bankAccounts={bankAccounts}
                suppliers={suppliers}
                accounts={accounts}
            />
        </div>
    );
}
