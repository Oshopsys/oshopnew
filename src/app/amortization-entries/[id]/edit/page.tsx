import { notFound } from "next/navigation";
import AmortizationEntryForm from "@/components/forms/amortization-entry-form";
import { AMORTIZATION_ENTRIES } from "@/lib/mock-data";

export default async function EditAmortizationEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const entry = AMORTIZATION_ENTRIES.find((e: any) => e.id === id);

    if (!entry) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <AmortizationEntryForm initialData={entry} mode="edit" entryId={id} />
        </div>
    );
}
