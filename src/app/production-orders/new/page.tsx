"use client";

import ProductionOrderForm from "@/components/forms/production-order-form";
import { getInventoryItems } from "@/app/actions/inventory";

export default async function NewProductionOrderPage() {
    const inventoryItems = await getInventoryItems();

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <ProductionOrderForm mode="create" inventoryItems={inventoryItems || []} />
        </div>
    );
}
