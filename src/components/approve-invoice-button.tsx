"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { approveInvoice } from "@/app/actions/invoices";
import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";

interface ApproveInvoiceButtonProps {
    invoiceId: string;
    currentStatus: string;
}

export function ApproveInvoiceButton({ invoiceId, currentStatus }: ApproveInvoiceButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    // const { toast } = useToast();

    if (currentStatus === 'POSTED' || currentStatus === 'PAID') {
        return null; // Don't show if already approved
    }

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await approveInvoice(invoiceId);
            // toast({
            //     title: "تم اعتماد الفاتورة بنجاح",
            //     description: "تم تحديث الحالة وإنشاء القيد المحاسبي.",
            // });
            alert("تم اعتماد الفاتورة بنجاح");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            // toast({
            //     variant: "destructive",
            //     title: "خطأ",
            //     description: error.message || "حدث خطأ أثناء اعتماد الفاتورة",
            // });
            alert("خطأ: " + (error.message || "حدث خطأ أثناء اعتماد الفاتورة"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الاعتماد...
                </>
            ) : (
                <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    اعتماد الفاتورة
                </>
            )}
        </Button>
    );
}
