import { notFound } from "next/navigation";
import EmployeeForm from "@/components/forms/employee-form";
import { getEmployee } from "@/app/actions/hr";

export default async function EditEmployeePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const employee = await getEmployee(id);

    if (!employee) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <EmployeeForm initialData={employee} mode="edit" employeeId={id} />
        </div>
    );
}
