import { notFound } from "next/navigation";
import DepreciationEntryForm from "@/components/forms/depreciation-entry-form";
import { DEPRECIATION_ENTRIES } from "@/lib/mock-data";

export default async function EditDepreciationEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const entry = DEPRECIATION_ENTRIES.find((e: any) => e.id === id);

    if (!entry) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <DepreciationEntryForm initialData={entry} mode="edit" entryId={id} />
        </div>
    );
}
