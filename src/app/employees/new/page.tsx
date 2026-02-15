"use client";

import EmployeeForm from "@/components/forms/employee-form";

export default function NewEmployeePage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <EmployeeForm mode="create" />
        </div>
    );
}
