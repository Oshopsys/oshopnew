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

    function onSubmit(data: InventoryItemFormValues) {
        if (mode === "edit" && itemId) {
            // TODO: Replace with API call
            const index = INVENTORY_ITEMS.findIndex((i: any) => i.id === itemId);
            if (index > -1) {
                INVENTORY_ITEMS[index] = {
                    ...INVENTORY_ITEMS[index],
                    ...data,
                    unit: data.unitName,
                    cost: data.purchasePrice,
                    price: data.salePrice
                };
            }
            console.log("Updated Inventory Item:", data);
            router.push(`/inventory-items/${itemId}`);
        } else {
            // TODO: Replace with API call
            const newItem = {
                id: String(INVENTORY_ITEMS.length + 1),
                ...data,
                unit: data.unitName,
                cost: data.purchasePrice,
                price: data.salePrice,
                quantity: 0 // Default quantity for new items
            };
            INVENTORY_ITEMS.push(newItem);
            console.log("Created Inventory Item:", data);
            router.push("/inventory-items");
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
