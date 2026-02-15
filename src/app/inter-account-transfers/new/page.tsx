
import TransferForm from "@/components/forms/transfer-form";
import { getBankAccounts } from "@/app/actions/treasury";

export default async function NewTransferPage() {
    const bankAccounts = await getBankAccounts();

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <TransferForm mode="create" bankAccounts={bankAccounts || []} />
        </div>
    );
}
