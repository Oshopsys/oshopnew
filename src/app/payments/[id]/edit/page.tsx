import { notFound } from "next/navigation";
import PaymentForm from "@/components/forms/payment-form";
import { getPaymentById, getBankAccounts } from "@/app/actions/treasury";
import { getSuppliers } from "@/app/actions/partners";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function EditPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [payment, bankAccounts, suppliers, accounts] = await Promise.all([
        getPaymentById(id),
        getBankAccounts(),
        getSuppliers(),
        getChartOfAccounts()
    ]);

    if (!payment) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PaymentForm
                initialData={payment}
                mode="edit"
                paymentId={id}
                bankAccounts={bankAccounts || []}
                suppliers={suppliers || []}
                accounts={accounts || []}
            />
        </div>
    );
}
