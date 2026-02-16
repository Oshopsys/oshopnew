// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYSLIPS, PAY_ITEMS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function PayslipDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const payslip = PAYSLIPS.find((p: any) => p.id === id);

    if (!payslip) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">قسيمة الراتب غير موجودة</p>
                        <Button className="mt-4" onClick={() => router.push("/payslips")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Support both simple and complex mock data structure
    const earningsList = Array.isArray(payslip.earnings)
        ? payslip.earnings
        : typeof payslip.earnings === 'number'
            ? [{ itemId: "1", amount: payslip.earnings }]
            : [];

    const deductionsList = Array.isArray(payslip.deductions)
        ? payslip.deductions
        : typeof payslip.deductions === 'number' && payslip.deductions > 0
            ? [{ itemId: "3", amount: payslip.deductions }]
            : [];

    const totalEarnings = typeof payslip.earnings === 'number' ? payslip.earnings : earningsList.reduce((sum: number, i: any) => sum + i.amount, 0);
    const totalDeductions = typeof payslip.deductions === 'number' ? payslip.deductions : deductionsList.reduce((sum: number, i: any) => sum + i.amount, 0);
    const netPay = payslip.netPay || (totalEarnings - totalDeductions);

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = PAYSLIPS.findIndex((p: any) => p.id === id);
        if (index > -1) {
            PAYSLIPS.splice(index, 1);
        }
        router.push("/payslips");
    };

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل قسيمة الراتب</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/payslips")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/payslips/${id}/edit`}>
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
                        <CardTitle>قسيمة راتب: {payslip.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(payslip.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الموظف:</span>
                                <p className="mt-1">{payslip.employee}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1">{payslip.description || "—"}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="bg-green-50/50 pb-2">
                            <CardTitle className="text-green-700 text-lg">المستحقات (Earnings)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {earningsList.map((item: any, index: number) => {
                                        const payItem = PAY_ITEMS.find(p => p.id === item.itemId);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{payItem ? payItem.name : "راتب أساسي"}</TableCell>
                                                <TableCell className="text-left font-medium">
                                                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <div className="mt-4 pt-2 border-t flex justify-between font-bold text-green-700">
                                <span>إجمالي المستحقات:</span>
                                <span>{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-red-50/50 pb-2">
                            <CardTitle className="text-red-700 text-lg">الاستقطاعات (Deductions)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {deductionsList.map((item: any, index: number) => {
                                        const payItem = PAY_ITEMS.find(p => p.id === item.itemId);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{payItem ? payItem.name : "خصم"}</TableCell>
                                                <TableCell className="text-left font-medium">
                                                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {deductionsList.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">لا توجد استقطاعات</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 pt-2 border-t flex justify-between font-bold text-red-700">
                                <span>إجمالي الاستقطاعات:</span>
                                <span>{totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>صافي الراتب المستحق:</span>
                            <span className="text-primary">{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف قسيمة الراتب وراتبه؟"
                itemName={`قسيمة ${payslip.id} - ${payslip.employee}`}
            />
        </>
    );
}
