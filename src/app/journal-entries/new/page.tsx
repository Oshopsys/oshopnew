import JournalEntryForm from "@/components/forms/journal-entry-form";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function NewJournalEntryPage() {
    const accounts = await getChartOfAccounts();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <JournalEntryForm mode="create" accounts={accounts} />
        </div>
    );
}
