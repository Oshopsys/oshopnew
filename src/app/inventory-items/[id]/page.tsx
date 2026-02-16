// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INVENTORY_ITEMS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function InventoryItemDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const item = INVENTORY_ITEMS.find((i: any) => i.id === id);

    if (!item) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">الصنف غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/inventory-items")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = INVENTORY_ITEMS.findIndex((i: any) => i.id === id);
        if (index > -1) {
            INVENTORY_ITEMS.splice(index, 1);
        }
        router.push("/inventory-items");
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل الصنف</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/inventory-items")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/inventory-items/${id}/edit`}>
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
                        <CardTitle>{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">الرمز:</span>
                                <p className="mt-1">{item.code}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الوحدة:</span>
                                <p className="mt-1">{item.unit}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">سعر البيع:</span>
                                <p className="mt-1 text-lg font-semibold">{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">تكلفة الشراء:</span>
                                <p className="mt-1 text-lg font-semibold">{item.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground">الكمية المتاحة:</span>
                            <p className="mt-1 text-2xl font-bold text-primary">
                                {item.quantity} {item.unit}
                            </p>
                        </div>

                        {item.description && (
                            <div className="bg-muted/10 p-4 rounded">
                                <span className="font-semibold text-muted-foreground">الوصف:</span>
                                <p className="mt-1 whitespace-pre-wrap">{item.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف هذا الصنف؟"
                itemName={item.name}
            />
        </>
    );
}
