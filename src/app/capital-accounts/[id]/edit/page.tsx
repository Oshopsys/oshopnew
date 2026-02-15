import { notFound } from "next/navigation";
import CapitalAccountForm from "@/components/forms/capital-account-form";
import { CAPITAL_ACCOUNTS } from "@/lib/mock-data";

export default async function EditCapitalAccountPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const account = CAPITAL_ACCOUNTS.find((a: any) => a.id === id);

    if (!account) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <CapitalAccountForm initialData={account} mode="edit" accountId={id} />
        </div>
    );
}
