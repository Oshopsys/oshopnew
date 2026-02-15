"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/delete-dialog";
// import { deletePartner } from "@/app/actions/partners"; // TODO: Implement delete action

export function CustomerDetailsClient({ customer }: { customer: any }) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        try {
            // await deletePartner(customer.id);
            alert("Delete not implemented yet");
            router.push("/customers");
            router.refresh();
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("حدث خطأ أثناء حذف العميل");
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">تفاصيل العميل</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/customers")}>
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/customers/${customer.id}/edit`}>
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
                        <CardTitle>{customer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">التسلسل:</span>
                                <p className="mt-1">{customer.id}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الرمز:</span>
                                <p className="mt-1">{customer.code || "—"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">البريد الإلكتروني:</span>
                                <p className="mt-1">{customer.email || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الرقم الضريبي:</span>
                                <p className="mt-1">{customer.taxIdentificationNumber || "—"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded">
                            <div>
                                <span className="font-semibold text-muted-foreground">عنوان الفوترة:</span>
                                <p className="mt-1 whitespace-pre-wrap">{customer.billingAddress || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">عنوان التسليم:</span>
                                <p className="mt-1 whitespace-pre-wrap">{customer.deliveryAddress || "—"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold text-muted-foreground">العملة:</span>
                                <p className="mt-1">{customer.currency || "LYD"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">الحد الإئتماني:</span>
                                <p className="mt-1">{customer.creditLimit?.toLocaleString() || "0"} د.ل</p>
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
                description="هل أنت متأكد من حذف هذا العميل؟"
                itemName={customer.name}
            />
        </>
    );
}
