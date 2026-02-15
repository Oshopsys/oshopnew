import { notFound } from "next/navigation";
import CustomerForm from "@/components/forms/customer-form";
import { getPartner } from "@/app/actions/partners";

export default async function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await getPartner(id);

    if (!customer) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <CustomerForm initialData={customer} mode="edit" customerId={id} />
        </div>
    );
}
