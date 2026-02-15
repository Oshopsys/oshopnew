
import IntangibleAssetForm from "@/components/forms/intangible-asset-form";

export default function NewIntangibleAssetPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <IntangibleAssetForm mode="create" />
        </div>
    );
}
