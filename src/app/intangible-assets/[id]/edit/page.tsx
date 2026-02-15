import { notFound } from "next/navigation";
import IntangibleAssetForm from "@/components/forms/intangible-asset-form";
import { INTANGIBLE_ASSETS } from "@/lib/mock-data";

export default async function EditIntangibleAssetPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const asset = INTANGIBLE_ASSETS.find((a: any) => a.id === id);

    if (!asset) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <IntangibleAssetForm initialData={asset} mode="edit" assetId={id} />
        </div>
    );
}
