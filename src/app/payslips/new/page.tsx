"use client";

import PayslipForm from "@/components/forms/payslip-form";

export default function NewPayslipPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PayslipForm mode="create" />
        </div>
    );
}
