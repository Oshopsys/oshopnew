"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { unpostJournalEntry } from "@/app/actions/accounting";

interface UnpostJournalButtonProps {
    entryId: string;
    currentStatus: string;
}

export function UnpostJournalButton({ entryId, currentStatus }: UnpostJournalButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Only show button if status is POSTED
    if (currentStatus !== 'POSTED') {
        return null;
    }

    const handleUnpost = async () => {
        if (!confirm("هل أنت متأكد من إلغاء ترحيل هذا القيد؟")) {
            return;
        }

        setIsLoading(true);
        try {
            await unpostJournalEntry(entryId);
            alert("✅ تم إلغاء الترحيل بنجاح");
            router.refresh();
        } catch (error: any) {
            alert("❌ " + (error.message || "فشل إلغاء الترحيل"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleUnpost}
            disabled={isLoading}
        >
            <RotateCcw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            إلغاء الترحيل
        </Button>
    );
}
