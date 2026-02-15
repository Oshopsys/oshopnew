"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTANGIBLE_ASSETS } from "@/lib/mock-data";
import { DeleteDialog } from "@/components/delete-dialog";

export default function IntangibleAssetDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const asset = INTANGIBLE_ASSETS.find((a: any) => a.id === id);

    if (!asset) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">الأصل غير الملموس غير موجود</p>
                        <Button className="mt-4" onClick={() => router.push("/intangible-assets")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDelete = () => {
        // TODO: Replace with API call
        const index = INTANGIBLE_ASSETS.findIndex((a: any) => a.id === id);
        if (index > -1) {
            INTANGIBLE_ASSETS.splice(index, 1);
        }
        router.push("/intangible-assets");
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل الأصل غير الملموس</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/intangible-assets")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/intangible-assets/${id}/edit`}>
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
                        <CardTitle>{asset.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">الكود:</span>
                                <p className="mt-1">{asset.code}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">معدل الإطفاء:</span>
                                <p className="mt-1">{asset.rate}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">تكلفة الاقتناء:</span>
                                <p className="mt-1 font-mono">{asset.acquisitionCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">مجمع الإطفاء:</span>
                                <p className="mt-1 font-mono text-red-600">{asset.amortization.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">القيمة الدفترية:</span>
                                <p className="mt-1 font-mono font-bold text-primary">{asset.bookValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</p>
                            </div>
                        </div>

                        {asset.description && (
                            <div className="bg-muted/10 p-4 rounded">
                                <span className="font-semibold text-muted-foreground">الوصف:</span>
                                <p className="mt-1">{asset.description}</p>
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
                description="هل أنت متأكد من حذف هذا الأصل؟"
                itemName={asset.name}
            />
        </>
    );
}
