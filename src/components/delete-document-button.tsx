"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteDocumentButtonProps {
    documentId: string;
    documentType: 'invoice' | 'receipt' | 'payment' | 'transfer' | 'journal-entry';
    deleteAction: (id: string) => Promise<any>;
    size?: 'sm' | 'default' | 'lg';
}

export function DeleteDocumentButton({
    documentId,
    documentType,
    deleteAction,
    size = 'sm'
}: DeleteDocumentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const documentTypeArabic = {
        'invoice': 'الفاتورة',
        'receipt': 'المقبوض',
        'payment': 'المدفوع',
        'transfer': 'التحويل',
        'journal-entry': 'القيد المحاسبي'
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteAction(documentId);
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert("خطأ: " + (error.message || "حدث خطأ أثناء الحذف"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={size}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">
                        تأكيد الحذف
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                        هل أنت متأكد من حذف {documentTypeArabic[documentType]}؟
                        <br />
                        <strong className="text-red-600">سيتم حذف جميع القيود المحاسبية والحركات المرتبطة بشكل نهائي.</strong>
                        <br />
                        هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الحذف...
                            </>
                        ) : (
                            'حذف نهائي'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
