import { notFound } from "next/navigation";
import SalesInvoiceForm from "@/components/forms/sales-invoice-form";
import { getInvoice } from "@/app/actions/invoices";
import { getCustomers } from "@/app/actions/partners";
import { getInventoryItems } from "@/app/actions/inventory";

export default async function EditSalesInvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [invoice, customers, items] = await Promise.all([
        getInvoice(id),
        getCustomers(),
        getInventoryItems()
    ]);

    if (!invoice) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <SalesInvoiceForm
                initialData={invoice}
                mode="edit"
                invoiceId={id}
                customers={customers || []}
                items={items || []}
            />
        </div>
    );
}
