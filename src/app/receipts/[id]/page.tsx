// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RECEIPTS, ACCOUNTS, CUSTOMERS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function ReceiptDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const receipt = RECEIPTS.find(r => r.id === id);

    if (!receipt) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">سند القبض غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/receipts")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const receivedInAccount = ACCOUNTS.find(a => a.id === receipt.receivedInAccountId);
    const payer = CUSTOMERS.find(c => c.id === receipt.payerId);
    const total = receipt.lines.reduce((sum, line) => sum + line.amount, 0);

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = RECEIPTS.findIndex(r => r.id === id);
        if (index > -1) {
            RECEIPTS.splice(index, 1);
        }
        router.push("/receipts");
    };

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل سند القبض</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/receipts")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/receipts/${id}/edit`}>
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
                        <CardTitle>سند قبض رقم: {receipt.reference || receipt.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(receipt.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">استلم في:</span>
                                <p className="mt-1">{receivedInAccount ? `${receivedInAccount.code} - ${receivedInAccount.name}` : "—"}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">جهة الدفع:</span>
                            <p className="mt-1">{payer?.name || "—"}</p>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1">{receipt.description || "—"}</p>
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
                                {receipt.lines.map((line, index) => {
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
                itemName={`سند رقم ${receipt.reference || receipt.id}`}
            />
        </>
    );
}
