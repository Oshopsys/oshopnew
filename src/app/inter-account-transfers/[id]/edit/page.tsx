import { notFound } from "next/navigation";
import TransferForm from "@/components/forms/transfer-form";
import { TRANSFERS } from "@/lib/mock-data";

export default async function EditTransferPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const transfer = TRANSFERS.find((t: any) => t.id === id);

    if (!transfer) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <TransferForm initialData={transfer} mode="edit" transferId={id} />
        </div>
    );
}
