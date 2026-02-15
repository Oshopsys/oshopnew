import { notFound } from "next/navigation";
import PayslipForm from "@/components/forms/payslip-form";
import { PAYSLIPS } from "@/lib/mock-data";

export default async function EditPayslipPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const payslip = PAYSLIPS.find((p: any) => p.id === id);

    if (!payslip) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <PayslipForm initialData={payslip} mode="edit" payslipId={id} />
        </div>
    );
}
