"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAPITAL_ACCOUNTS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function CapitalAccountDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const account = CAPITAL_ACCOUNTS.find((a: any) => a.id === id);

    if (!account) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">حساب رأس المال غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/capital-accounts")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = CAPITAL_ACCOUNTS.findIndex((a: any) => a.id === id);
        if (index > -1) {
            CAPITAL_ACCOUNTS.splice(index, 1);
        }
        router.push("/capital-accounts");
    };

    return (
        <>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل حساب رأس المال</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/capital-accounts")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/capital-accounts/${id}/edit`}>
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
                        <CardTitle>{account.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">الكود:</span>
                                <p className="mt-1">{account.code}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الرصيد الحالي:</span>
                                <p className="mt-1 font-bold text-lg text-primary">{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف حساب رأس المال هذا؟"
                itemName={account.name}
            />
        </>
    );
}
