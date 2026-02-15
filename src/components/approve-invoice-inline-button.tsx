"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { approveInvoice } from "@/app/actions/invoices";

interface ApproveInvoiceInlineButtonProps {
    invoiceId: string;
    currentStatus: string;
}

export function ApproveInvoiceInlineButton({ invoiceId, currentStatus }: ApproveInvoiceInlineButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Don't show button if already approved
    if (currentStatus === 'POSTED' || currentStatus === 'PAID') {
        return null;
    }

    const handleApprove = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click if any
        e.preventDefault();

        setIsLoading(true);
        try {
            await approveInvoice(invoiceId);
            router.refresh(); // Refresh to show updated status
        } catch (error: any) {
            console.error(error);
            alert("خطأ: " + (error.message || "حدث خطأ أثناء اعتماد الفاتورة"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleApprove}
            disabled={isLoading}
            size="sm"
            variant="default"
            className="bg-green-600 hover:bg-green-700"
        >
            {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
                <CheckCircle2 className="mr-1 h-3 w-3" />
            )}
            {isLoading ? "جاري..." : "اعتماد"}
        </Button>
    );
}
