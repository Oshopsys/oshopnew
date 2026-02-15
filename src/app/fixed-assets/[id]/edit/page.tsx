import { notFound } from "next/navigation";
import FixedAssetForm from "@/components/forms/fixed-asset-form";
import { FIXED_ASSETS } from "@/lib/mock-data";

export default async function EditFixedAssetPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const asset = FIXED_ASSETS.find((a: any) => a.id === id);

    if (!asset) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <FixedAssetForm initialData={asset} mode="edit" assetId={id} />
        </div>
    );
}
