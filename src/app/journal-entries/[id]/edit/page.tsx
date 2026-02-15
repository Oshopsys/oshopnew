import { notFound } from "next/navigation";
import JournalEntryForm from "@/components/forms/journal-entry-form";
import { JOURNAL_ENTRIES } from "@/lib/mock-data";

export default async function EditJournalEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const entry = JOURNAL_ENTRIES.find((e: any) => e.id === id);

    if (!entry) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <JournalEntryForm initialData={entry} mode="edit" entryId={id} />
        </div>
    );
}
