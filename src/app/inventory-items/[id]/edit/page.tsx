import { notFound } from "next/navigation";
import InventoryItemForm from "@/components/forms/inventory-item-form";
import { INVENTORY_ITEMS } from "@/lib/mock-data";

export default async function EditInventoryItemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const item = INVENTORY_ITEMS.find((i: any) => i.id === id);

    if (!item) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <InventoryItemForm initialData={item} mode="edit" itemId={id} />
        </div>
    );
}
