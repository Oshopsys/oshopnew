"use client";

import InventoryItemForm from "@/components/forms/inventory-item-form";

export default function NewInventoryItemPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <InventoryItemForm mode="create" />
        </div>
    );
}
