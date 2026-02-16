// @ts-nocheck
import { getPartner } from "@/app/actions/partners";
import { notFound } from "next/navigation";
import { CustomerDetailsClient } from "./client";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await getPartner(id);

    if (!customer) {
        notFound();
    }

    // Map DB fields to UI expected format
    const formattedCustomer = {
        ...customer,
        billingAddress: customer.address,
        taxIdentificationNumber: customer.tax_number,
    };

    return <CustomerDetailsClient customer={formattedCustomer} />;
}
