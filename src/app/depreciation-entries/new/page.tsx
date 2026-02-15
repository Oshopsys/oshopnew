
import DepreciationEntryForm from "@/components/forms/depreciation-entry-form";
import { getFixedAssets } from "@/app/actions/assets";

export default async function NewDepreciationEntryPage() {
    const assets = await getFixedAssets() || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <DepreciationEntryForm mode="create" assets={assets} />
        </div>
    );
}
