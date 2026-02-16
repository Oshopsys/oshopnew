// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JOURNAL_ENTRIES, ACCOUNTS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function JournalEntryDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const entry = JOURNAL_ENTRIES.find(e => e.id === id);

    if (!entry) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">القيد المحاسبي غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/journal-entries")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default to empty array if lines key missing
    const lines = entry.lines || [];
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = JOURNAL_ENTRIES.findIndex(e => e.id === id);
        if (index > -1) {
            JOURNAL_ENTRIES.splice(index, 1);
        }
        router.push("/journal-entries");
    };

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل القيد المحاسبي</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/journal-entries")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/journal-entries/${id}/edit`}>
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
                        <CardTitle>قيد رقم: {entry.reference || entry.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(entry.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الحالة:</span>
                                <p className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${entry.isPosted
                                        ? 'bg-green-100 text-green-700'
                                        : isBalanced
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {entry.isPosted ? "مرحل" : isBalanced ? "متزن" : "غير متزن"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1">{entry.description || "—"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>سطور القيد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">#</TableHead>
                                    <TableHead className="text-right">الحساب</TableHead>
                                    <TableHead className="text-right">البيان</TableHead>
                                    <TableHead className="text-right">مدين</TableHead>
                                    <TableHead className="text-right">دائن</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => {
                                    const account = ACCOUNTS.find(a => a.id === line.accountId);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {account ? `${account.code} - ${account.name}` : line.accountId}
                                            </TableCell>
                                            <TableCell>{line.description || "—"}</TableCell>
                                            <TableCell className="font-medium">
                                                {line.debit > 0 ? line.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {line.credit > 0 ? line.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <div className="mt-4 flex justify-end">
                            <div className="w-96 space-y-2 border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="font-semibold">إجمالي المدين:</span>
                                    <span className="font-medium">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">إجمالي الدائن:</span>
                                    <span className="font-medium">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                                </div>
                                <div className={`flex justify-between text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                    <span>الفرق:</span>
                                    <span>{Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
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
                description="هل أنت متأكد من حذف هذا القيد؟"
                itemName={`القيد رقم ${entry.reference || entry.id}`}
            />
        </>
    );
}
