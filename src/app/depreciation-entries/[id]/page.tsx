// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEPRECIATION_ENTRIES, FIXED_ASSETS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function DepreciationEntryDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const entry = DEPRECIATION_ENTRIES.find((e: any) => e.id === id);

    if (!entry) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">قيد الإهلاك غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/depreciation-entries")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Support lines array or fallback to simple structure
    const lines = (entry as any).lines || ((entry as any).amount ? [{ assetId: "Unknown", amount: (entry as any).amount }] : []);

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = DEPRECIATION_ENTRIES.findIndex((e: any) => e.id === id);
        if (index > -1) {
            DEPRECIATION_ENTRIES.splice(index, 1);
        }
        router.push("/depreciation-entries");
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل قيد الإهلاك</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/depreciation-entries")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/depreciation-entries/${id}/edit`}>
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
                        <CardTitle>قيد رقم: {entry.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(entry.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">المرجع:</span>
                                <p className="mt-1">{entry.reference || "—"}</p>
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
                        <CardTitle>تفاصيل الأصول المهلكة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">#</TableHead>
                                    <TableHead className="text-right">الأصل الثابت</TableHead>
                                    <TableHead className="text-right">مبلغ الإهلاك</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((item: any, index: number) => {
                                    const asset = FIXED_ASSETS.find(a => a.id === item.assetId);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {asset ? `${asset.code} - ${asset.name}` : item.assetId}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div className="mt-4 pt-2 border-t flex justify-end gap-8 font-bold text-lg">
                            <span>الإجمالي:</span>
                            <span>{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف قيد الإهلاك هذا؟"
                itemName={`القيد ${entry.id}`}
            />
        </>
    );
}
