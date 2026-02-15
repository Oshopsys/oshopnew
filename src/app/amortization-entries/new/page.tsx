
import AmortizationEntryForm from "@/components/forms/amortization-entry-form";
import { getIntangibleAssets } from "@/app/actions/assets";

export default async function NewAmortizationEntryPage() {
    const assets = await getIntangibleAssets() || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <AmortizationEntryForm mode="create" assets={assets} />
        </div>
    );
}
