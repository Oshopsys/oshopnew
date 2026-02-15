"use client";

import SupplierForm from "@/components/forms/supplier-form";

export default function NewSupplierPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <SupplierForm mode="create" />
        </div>
    );
}
