// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUCTION_ORDERS, INVENTORY_ITEMS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function ProductionOrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const order = PRODUCTION_ORDERS.find((o: any) => o.id === id);

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">أمر الإنتاج غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/production-orders")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Support optional billOfMaterials
    const billOfMaterials = order.billOfMaterials || [];

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = PRODUCTION_ORDERS.findIndex((o: any) => o.id === id);
        if (index > -1) {
            PRODUCTION_ORDERS.splice(index, 1);
        }
        router.push("/production-orders");
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل أمر الإنتاج</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/production-orders")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/production-orders/${id}/edit`}>
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
                        <CardTitle>أمر إنتاج رقم: {order.reference || order.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                                <p className="mt-1">{new Date(order.date).toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الحالة:</span>
                                <p className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${order.status === "كتمل" || order.status === "Completed" ? "bg-green-100 text-green-700" :
                                        order.status === "قيد التنفيذ" || order.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-700"
                                        }`}>
                                        {order.status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-md">
                            <div>
                                <span className="font-semibold text-muted-foreground">المنتج النهائي:</span>
                                <p className="mt-1 text-lg font-bold">{order.finishedItem}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الكمية:</span>
                                <p className="mt-1 text-lg font-bold">{order.quantity}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">البيان:</span>
                            <p className="mt-1">{order.description || "—"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>المواد الخام المستهلكة (BOM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">#</TableHead>
                                    <TableHead className="text-right">الصنف</TableHead>
                                    <TableHead className="text-right">الكمية</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billOfMaterials.map((item: any, index: number) => {
                                    const inventoryItem = INVENTORY_ITEMS.find(i => i.id === item.itemId);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {inventoryItem ? `${inventoryItem.code} - ${inventoryItem.name}` : item.itemId}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.quantity}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {billOfMaterials.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">لا توجد مواد خام مسجلة</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف أمر الإنتاج هذا؟"
                itemName={order.reference || order.id}
            />
        </>
    );
}
