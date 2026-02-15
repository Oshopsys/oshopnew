"use client";

import JournalEntryForm from "@/components/forms/journal-entry-form";

export default function NewJournalEntryPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <JournalEntryForm mode="create" />
        </div>
    );
}
