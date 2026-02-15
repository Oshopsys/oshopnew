import { notFound } from "next/navigation";
import BankAccountForm from "@/components/forms/bank-account-form";
import { getBankAccount } from "@/app/actions/treasury";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function EditBankAccountPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [account, accounts] = await Promise.all([
        getBankAccount(id),
        getChartOfAccounts()
    ]);

    if (!account) {
        notFound();
    }

    // Adapt account structure for form if needed
    // The form expects glAccountId to be mapped from gl_account_id if present
    const initialData = {
        ...account,
        accountNumber: account.account_number,
        glAccountId: account.gl_account_id,
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">تعديل حساب بنكي</h1>
            <BankAccountForm
                initialData={initialData}
                mode="edit"
                accountId={id}
                accounts={accounts || []}
            />
        </div>
    );
}
