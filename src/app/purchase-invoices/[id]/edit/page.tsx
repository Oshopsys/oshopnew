import { notFound } from "next/navigation";
import PurchaseInvoiceForm from "@/components/forms/purchase-invoice-form";
import { PURCHASE_INVOICES } from "@/lib/mock-data";

export default async function EditPurchaseInvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const invoice = PURCHASE_INVOICES.find((inv: any) => inv.id === id);

    if (!invoice) {
        notFound();
    }

    // Ensure lines exist, mock if missing
    const invoiceWithLines = {
        ...invoice,
        lines: invoice.lines || [{ itemId: "", description: "بند افتراضي", quantity: 1, unitPrice: invoice.amount || 0, discount: 0 }]
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PurchaseInvoiceForm initialData={invoiceWithLines} mode="edit" invoiceId={id} />
        </div>
    );
}
