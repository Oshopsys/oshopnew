"use client";

import CustomerForm from "@/components/forms/customer-form";

export default function NewCustomerPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <CustomerForm mode="create" />
        </div>
    );
}
