// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPLIERS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function SupplierDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const supplier = SUPPLIERS.find((s: any) => s.id === id);

    if (!supplier) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">المورد غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/suppliers")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = SUPPLIERS.findIndex((s: any) => s.id === id);
        if (index > -1) {
            SUPPLIERS.splice(index, 1);
        }
        router.push("/suppliers");
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل المورد</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/suppliers")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/suppliers/${id}/edit`}>
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
                        <CardTitle>{supplier.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التسلسل:</span>
                                <p className="mt-1">{supplier.id}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الرمز:</span>
                                <p className="mt-1">{(supplier as any).code || "—"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">البريد الإلكتروني:</span>
                                <p className="mt-1">{supplier.email || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الرقم الضريبي:</span>
                                <p className="mt-1">{(supplier as any).taxIdentificationNumber || "—"}</p>
                            </div>
                        </div>

                        <div className="bg-muted/10 p-4 rounded">
                            <span className="font-semibold text-muted-foreground">العنوان:</span>
                            <p className="mt-1 whitespace-pre-wrap">{supplier.address || "—"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">العملة:</span>
                                <p className="mt-1">{(supplier as any).currency || "LYD"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الحد الإئتماني:</span>
                                <p className="mt-1">{(supplier as any).creditLimit?.toLocaleString() || "0"} د.ل</p>
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
                description="هل أنت متأكد من حذف هذا المورد؟"
                itemName={supplier.name}
            />
        </>
    );
}
