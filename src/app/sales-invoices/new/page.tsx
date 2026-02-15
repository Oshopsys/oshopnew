

import SalesInvoiceForm from "@/components/forms/sales-invoice-form";
import { getCustomers } from "@/app/actions/partners";
import { getInventoryItems } from "@/app/actions/inventory";

export const dynamic = 'force-dynamic';

export default async function NewSalesInvoicePage() {
    const customers = await getCustomers();
    const items = await getInventoryItems();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <SalesInvoiceForm
                mode="create"
                customers={customers || []}
                items={items || []}
            />
        </div>
    );
}
