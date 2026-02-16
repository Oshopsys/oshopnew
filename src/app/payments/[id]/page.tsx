// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYMENTS, ACCOUNTS, SUPPLIERS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function PaymentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const payment = PAYMENTS.find(p => p.id === id);

    if (!payment) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">سند الصرف غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/payments")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const paidFromAccount = ACCOUNTS.find(a => a.id === payment.paidFromAccountId);
    const payee = SUPPLIERS.find(s => s.id === payment.payeeId);
    const total = payment.lines.reduce((sum, line) => sum + line.amount, 0);

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = PAYMENTS.findIndex(p => p.id === id);
        if (index > -1) {
            PAYMENTS.splice(index, 1);
        }
        router.push("/payments");
    };

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل سند الصرف</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/payments")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/payments/${id}/edit`}>
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
                        <CardTitle>سند صرف رقم: {payment.reference || payment.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(payment.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">مدفوع من:</span>
                                <p className="mt-1">{paidFromAccount ? `${paidFromAccount.code} - ${paidFromAccount.name}` : "—"}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">المستفيد:</span>
                            <p className="mt-1">{payee?.name || "—"}</p>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1">{payment.description || "—"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>التفاصيل</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">#</TableHead>
                                    <TableHead className="text-right">الحساب</TableHead>
                                    <TableHead className="text-right">الوصف</TableHead>
                                    <TableHead className="text-right">المبلغ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payment.lines.map((line, index) => {
                                    const account = ACCOUNTS.find(a => a.id === line.accountId);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {account ? `${account.code} - ${account.name}` : line.accountId}
                                            </TableCell>
                                            <TableCell>{line.description || "—"}</TableCell>
                                            <TableCell className="font-medium">
                                                {line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <div className="mt-4 flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>الإجمالي:</span>
                                    <span>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                                </div>
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
                description="هل أنت متأكد من حذف هذا السند؟"
                itemName={`سند رقم ${payment.reference || payment.id}`}
            />
        </>
    );
}
