import { notFound } from "next/navigation";
import ReceiptForm from "@/components/forms/receipt-form";
import { getPaymentById, getBankAccounts } from "@/app/actions/treasury";
import { getCustomers } from "@/app/actions/partners";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function EditReceiptPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [receipt, bankAccounts, customers, accounts] = await Promise.all([
        getPaymentById(id),
        getBankAccounts(),
        getCustomers(),
        getChartOfAccounts()
    ]);

    if (!receipt) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <ReceiptForm
                initialData={receipt}
                mode="edit"
                receiptId={id}
                bankAccounts={bankAccounts || []}
                customers={customers || []}
                accounts={accounts || []}
            />
        </div>
    );
}
