

import PurchaseInvoiceForm from "@/components/forms/purchase-invoice-form";
import { getSuppliers } from "@/app/actions/partners";
import { getInventoryItems } from "@/app/actions/inventory";

export const dynamic = 'force-dynamic';

export default async function NewPurchaseInvoicePage() {
    const suppliers = await getSuppliers();
    const items = await getInventoryItems();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PurchaseInvoiceForm
                mode="create"
                suppliers={suppliers || []}
                items={items || []}
            />
        </div>
    );
}
