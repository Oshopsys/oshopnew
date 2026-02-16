"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Combobox } from "@/components/ui/combobox";
import { ACCOUNTS, INVENTORY_ITEMS } from "@/lib/mock-data";
import { createInventoryItem, updateInventoryItem } from "@/app/actions/inventory-actions";

const inventoryItemSchema = z.object({
    code: z.string().min(1, "Item Code is required"),
    name: z.string().min(1, "Item Name is required"),
    unitName: z.string().optional(),
    purchasePrice: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    description: z.string().optional(),
    incomeAccountId: z.string().optional(),
    expenseAccountId: z.string().optional(),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    itemId?: string;
}

export default function InventoryItemForm({
    initialData,
    mode = "create",
    itemId,
}: InventoryItemFormProps) {
    const router = useRouter();

    const defaultValues: InventoryItemFormValues = initialData
        ? {
            code: initialData.code || "",
            name: initialData.name || "",
            unitName: initialData.unit || "",
            purchasePrice: initialData.cost || 0,
            salePrice: initialData.price || 0,
            description: initialData.description || "",
            incomeAccountId: initialData.incomeAccountId || "",
            expenseAccountId: initialData.expenseAccountId || "",
        }
        : {
            code: "",
            name: "",
            unitName: "",
            purchasePrice: 0,
            salePrice: 0,
            description: "",
            incomeAccountId: "",
            expenseAccountId: "",
        };

    const form = useForm<InventoryItemFormValues>({
        resolver: zodResolver(inventoryItemSchema),
        defaultValues,
    });

    async function onSubmit(data: InventoryItemFormValues) {
        try {
            if (mode === "edit" && itemId) {
                await updateInventoryItem(itemId, {
                    ...data,
                    // unit: data.unitName, // Column does not exist
                    cost_price: data.purchasePrice || 0,
                    sales_price: data.salePrice || 0
                });
                console.log("Updated Inventory Item:", data);
                router.push(`/inventory-items/${itemId}`);
                router.refresh();
            } else {
                await createInventoryItem({
                    code: data.code,
                    name: data.name,
                    // unit: data.unitName, // Column does not exist
                    cost_price: data.purchasePrice || 0,
                    sales_price: data.salePrice || 0,
                    description: data.description,
                    // incomeAccountId: data.incomeAccountId, // Column does not exist
                    // expenseAccountId: data.expenseAccountId, // Column does not exist
                    quantity_on_hand: 0 // Default quantity
                });
                console.log("Created Inventory Item:", data);
                router.push("/inventory-items");
                router.refresh();
            }
        } catch (error) {
            console.error("Error saving inventory item:", error);
            // You might want to show a toast error here
        }
    }

    function handleCancel() {
        if (mode === "edit" && itemId) {
            router.push(`/inventory-items/${itemId}`);
        } else {
            router.push("/inventory-items");
        }
    }

    const accountOptions = ACCOUNTS.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل صنف مخزون" : "صنف مخزون جديد"}
                    </h1>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            إلغاء
                        </Button>
                        <Button type="submit">
                            <Save className="ml-2 h-4 w-4" />
                            {mode === "edit" ? "حفظ التعديلات" : "إنشاء"}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6 grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>رمز الصنف</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ITEM-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اسم الصنف</FormLabel>
                                        <FormControl>
                                            <Input placeholder="اسم المنتج..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="unitName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>اسم الوحدة</FormLabel>
                                    <FormControl>
                                        <Input placeholder="مثال: قطعة، كجم، صندوق" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="salePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>سعر البيع</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("salePrice", { valueAsNumber: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchasePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>سعر الشراء</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("purchasePrice", {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الوصف</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="وصف الصنف..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="my-2" />

                        <FormField
                            control={form.control}
                            name="incomeAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>حساب الإيرادات المخصص</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={accountOptions.filter(
                                                (a) =>
                                                    ACCOUNTS.find((acc) => acc.id === a.value)?.type ===
                                                    "Revenue"
                                            )}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="اختر حساب..."
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        اختياري: لتوجيه المبيعات لحساب معين.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
