// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRANSFERS, ACCOUNTS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function TransferDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const transfer = TRANSFERS.find(t => t.id === id);

    if (!transfer) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">التحويل غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/inter-account-transfers")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const fromAccount = ACCOUNTS.find(a => a.id === transfer.paidFromAccountId);
    const toAccount = ACCOUNTS.find(a => a.id === transfer.receivedInAccountId);

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = TRANSFERS.findIndex(t => t.id === id);
        if (index > -1) {
            TRANSFERS.splice(index, 1);
        }
        router.push("/inter-account-transfers");
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل التحويل</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/inter-account-transfers")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/inter-account-transfers/${id}/edit`}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>تحويل رقم: {transfer.reference || transfer.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(transfer.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">المبلغ:</span>
                                <p className="mt-1 text-xl font-bold text-primary">
                                    {transfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-muted/20 p-6 rounded-lg border">
                            <div className="text-center flex-1">
                                <span className="font-semibold text-muted-foreground block mb-2">من حساب</span>
                                <p className="font-medium">{fromAccount ? `${fromAccount.code} - ${fromAccount.name}` : transfer.paidFromAccountId}</p>
                            </div>

                            <ArrowLeft className="h-6 w-6 text-muted-foreground mx-4" />

                            <div className="text-center flex-1">
                                <span className="font-semibold text-muted-foreground block mb-2">إلى حساب</span>
                                <p className="font-medium">{toAccount ? `${toAccount.code} - ${toAccount.name}` : transfer.receivedInAccountId}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1 bg-muted/10 p-3 rounded">{transfer.description || "—"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف هذا التحويل؟"
                itemName={`تحويل رقم ${transfer.reference || transfer.id}`}
            />
        </>
    );
}
