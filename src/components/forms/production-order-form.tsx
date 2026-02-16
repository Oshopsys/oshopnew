"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Save } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProductionOrder } from "@/app/actions/production";

const productionOrderSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    finishedProductId: z.string().min(1, "Finished Item is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    billOfMaterials: z.array(
        z.object({
            itemId: z.string().min(1, "Raw Material is required"),
            quantity: z.number().min(0.01),
        })
    ).min(1, "At least one raw material is required"),
});

type ProductionOrderFormValues = z.infer<typeof productionOrderSchema>;

interface ProductionOrderFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    orderId?: string;
    inventoryItems?: { id: string; name: string; code: string }[];
}

export default function ProductionOrderForm({
    initialData,
    mode = "create",
    orderId,
    inventoryItems = [],
}: ProductionOrderFormProps) {
    const router = useRouter();

    const defaultValues: ProductionOrderFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            finishedProductId: initialData.finished_product_id || "",
            quantity: initialData.quantity || 1,
            description: initialData.description || "",
            status: initialData.status || "DRAFT",
            billOfMaterials: initialData.billOfMaterials || [
                { itemId: "", quantity: 1 }
            ],
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            finishedProductId: "",
            quantity: 1,
            description: "",
            status: "DRAFT",
            billOfMaterials: [
                { itemId: "", quantity: 1 }
            ],
        };

    const form = useForm<ProductionOrderFormValues>({
        resolver: zodResolver(productionOrderSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "billOfMaterials",
        control: form.control,
    });

    async function onSubmit(data: ProductionOrderFormValues) {
        try {
            if (mode === "edit" && orderId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                await createProductionOrder(data);
                console.log("Created Production Order Successfully");
                router.push("/production-orders");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create production order");
        }
    }

    function handleCancel() {
        if (mode === "edit" && orderId) {
            router.push(`/production-orders/${orderId}`);
        } else {
            router.push("/production-orders");
        }
    }

    const itemOptions = inventoryItems.map(i => ({ value: i.id, label: `${i.code} - ${i.name}` }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل أمر إنتاج" : "أمر إنتاج جديد"}
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
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>التاريخ</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>المرجع #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PO-XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border">
                            <FormField
                                control={form.control}
                                name="finishedProductId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الصنف منتهي الصنع (الناتج)</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={itemOptions}
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="اختر المنتج النهائي..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الكمية المنتجة</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...form.register("quantity", { valueAsNumber: true })}
                                                className="font-bold text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الحالة</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الحالة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">مسودة</SelectItem>
                                                <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                                                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                                <SelectItem value="CANCELLED">ملغي</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>البيان</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="وصف لأمر الإنتاج..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 bg-muted/50 font-semibold border-b">
                            قائمة المواد الخام (Bill of Materials)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-muted/20 text-muted-foreground">
                                    <tr>
                                        <th className="p-3 w-[50px]"></th>
                                        <th className="p-3 w-[300px]">الصنف (المادة الخام)</th>
                                        <th className="p-3 w-[150px]">الكمية المستهلكة</th>
                                        <th className="p-3">ملاحظات</th>
                                        <th className="p-3 w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fields.map((field, index) => (
                                        <tr
                                            key={field.id}
                                            className="group hover:bg-muted/30 align-top"
                                        >
                                            <td className="p-3 text-center text-muted-foreground">
                                                {index + 1}
                                            </td>
                                            <td className="p-3">
                                                <Combobox
                                                    options={itemOptions}
                                                    value={
                                                        form.watch(`billOfMaterials.${index}.itemId`) || ""
                                                    }
                                                    onChange={(val) =>
                                                        form.setValue(`billOfMaterials.${index}.itemId`, val)
                                                    }
                                                    placeholder="اختر مادة خام..."
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`billOfMaterials.${index}.quantity`, {
                                                        valueAsNumber: true,
                                                    })}
                                                />
                                            </td>
                                            <td className="p-3">{/* Placeholder for notes if needed */}</td>
                                            <td className="p-3">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="p-2 border-t">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-primary"
                                                onClick={() => append({ itemId: "", quantity: 1 })}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> إضافة مادة خام
                                            </Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
