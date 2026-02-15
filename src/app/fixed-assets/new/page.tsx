"use client";

import FixedAssetForm from "@/components/forms/fixed-asset-form";

export default function NewFixedAssetPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <FixedAssetForm mode="create" />
        </div>
    );
}
