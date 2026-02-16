import { notFound } from "next/navigation";
import SupplierForm from "@/components/forms/supplier-form";
import { getPartner } from "@/app/actions/partners";

export default async function EditSupplierPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supplier = await getPartner(id);

    if (!supplier) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <SupplierForm initialData={supplier} mode="edit" supplierId={id} />
        </div>
    );
}
