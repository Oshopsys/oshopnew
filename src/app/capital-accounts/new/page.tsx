
import CapitalAccountForm from "@/components/forms/capital-account-form";

export default function NewCapitalAccountPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <CapitalAccountForm mode="create" />
        </div>
    );
}
