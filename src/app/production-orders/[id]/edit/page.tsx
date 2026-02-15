import { notFound } from "next/navigation";
import ProductionOrderForm from "@/components/forms/production-order-form";
import { PRODUCTION_ORDERS } from "@/lib/mock-data";

export default async function EditProductionOrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = PRODUCTION_ORDERS.find((o: any) => o.id === id);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <ProductionOrderForm initialData={order} mode="edit" orderId={id} />
        </div>
    );
}
