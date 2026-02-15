import BankAccountForm from "@/components/forms/bank-account-form";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default async function NewBankAccountPage() {
    const accounts = await getChartOfAccounts();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">إنشاء حساب بنكي جديد</h1>
            <BankAccountForm mode="create" accounts={accounts || []} />
        </div>
    );
}
