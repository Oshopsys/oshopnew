"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { createInvoice, updateInvoice } from "@/app/actions/invoices";
// import { useToast } from "@/hooks/use-toast";

const invoiceSchema = z.object({
    date: z.string(),
    dueDate: z.string().optional(),
    reference: z.string().optional(),
    customerId: z.string().min(1, "Customer is required"),
    billingAddress: z.string().optional(),
    lines: z.array(
        z.object({
            itemId: z.string().optional(),
            description: z.string().min(1, "Description is required"),
            quantity: z.number().min(0),
            unitPrice: z.number().min(0),
            discount: z.number().min(0).optional(),
        })
    ).min(1, "At least one line item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface SalesInvoiceFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    invoiceId?: string;
    customers: { id: string; name: string }[];
    items: { id: string; name: string; code?: string; sales_price?: number }[];
}

export default function SalesInvoiceForm({
    initialData,
    mode = "create",
    invoiceId,
    customers,
    items
}: SalesInvoiceFormProps) {
    const router = useRouter();
    // const { toast } = useToast();

    const defaultValues: InvoiceFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            customerId: initialData.partner_id || "",
            billingAddress: initialData.notes || "", // using notes as address/billing for now? or separate field
            lines: initialData.lines?.map((l: any) => ({
                itemId: l.item_id,
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unit_price,
                discount: 0 // field missing in db schema currently?
            })) || [
                    { itemId: "", description: "", quantity: 1, unitPrice: 0, discount: 0 }
                ],
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            customerId: "",
            billingAddress: "",
            lines: [
                { itemId: "", description: "", quantity: 1, unitPrice: 0, discount: 0 }
            ],
        };

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "lines",
        control: form.control,
    });

    const lines = useWatch({ control: form.control, name: "lines" });

    const totalAmount = lines.reduce((sum, line) => {
        const lineTotal = (line.quantity || 0) * (line.unitPrice || 0) - (line.discount || 0);
        return sum + lineTotal;
    }, 0);

    async function onSubmit(data: InvoiceFormValues) {
        try {
            const invoiceData = {
                date: new Date(data.date).toISOString(),
                // Keep existing number if editing, else generate (or let DB handle if serial)
                invoice_number: `INV-${Date.now()}`,
                partner_id: data.customerId,
                total: totalAmount,
                status: 'DRAFT' as const,
                type: 'SALE' as const,
                notes: data.billingAddress || '',
                reference: data.reference, // Added back as column exists now
                description: data.billingAddress // Mapping billing address/notes to description for now
            };

            const invoiceLines = data.lines.map(line => ({
                item_id: line.itemId || null,
                description: line.description,
                quantity: line.quantity,
                unit_price: line.unitPrice,
                discount: line.discount || 0
            }));

            if (mode === "edit" && invoiceId) {
                await updateInvoice(invoiceId, invoiceData, invoiceLines as any);
                router.push(`/sales-invoices/${invoiceId}`);
                router.refresh();
            } else {
                const result = await createInvoice(invoiceData as any, invoiceLines as any);

                if (result && result.invoice_id) {
                    // Redirect to the new invoice details page
                    router.push(`/sales-invoices/${result.invoice_id}`);
                    router.refresh();
                } else {
                    // Fallback to list if no ID returned (shouldn't happen with success:true)
                    router.push("/sales-invoices");
                    router.refresh();
                }
            }
        } catch (error: any) {
            console.error('Error in invoice creation:', error);
            alert("❌ " + (error.message || "حدث خطأ أثناء حفظ الفاتورة"));
        }
    }

    function handleCancel() {
        if (mode === "edit" && invoiceId) {
            router.push(`/sales-invoices/${invoiceId}`);
        } else {
            router.push("/sales-invoices");
        }
    }

    const handleItemSelect = (index: number, itemId: string) => {
        const selectedItem = items.find(i => i.id === itemId);
        if (selectedItem) {
            form.setValue(`lines.${index}.itemId`, itemId);
            form.setValue(`lines.${index}.description`, selectedItem.name);
            form.setValue(`lines.${index}.unitPrice`, selectedItem.sales_price || 0);
        }
    };

    const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
    const itemOptions = items.map(i => ({ value: i.id, label: `${i.code || ''} - ${i.name}` }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل فاتورة مبيعات" : "فاتورة مبيعات جديدة"}
                    </h1>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            إلغاء
                        </Button>
                        <Button type="submit">
                            <Save className="ml-2 h-4 w-4" />
                            {mode === "edit" ? "حفظ التعديلات" : "إنشاء المسودة"}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>تاريخ الإصدار</FormLabel>
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
                                        <div className="flex gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Input placeholder="رقم المرجع" {...field} />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>العميل</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={customerOptions}
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                            }}
                                            placeholder="اختر عميل..."
                                            searchPlaceholder="بحث عن عميل..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billingAddress"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>ملاحظات / عنوان الفوترة</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="العنوان..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="p-3 w-[50px]"></th>
                                        <th className="p-3 w-[250px]">البند</th>
                                        <th className="p-3">الوصف</th>
                                        <th className="p-3 w-[100px]">الكمية</th>
                                        <th className="p-3 w-[120px]">سعر الوحدة</th>
                                        <th className="p-3 w-[120px]">الخصم</th>
                                        <th className="p-3 w-[120px]">الإجمالي</th>
                                        <th className="p-3 w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fields.map((field, index) => {
                                        const qty = form.watch(`lines.${index}.quantity`) || 0;
                                        const price = form.watch(`lines.${index}.unitPrice`) || 0;
                                        const discount = form.watch(`lines.${index}.discount`) || 0;
                                        const lineTotal = (qty * price) - discount;

                                        return (
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
                                                        value={form.watch(`lines.${index}.itemId`) || ""}
                                                        onChange={(val) => handleItemSelect(index, val)}
                                                        placeholder="اختر صنف..."
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        {...form.register(`lines.${index}.description`)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        {...form.register(`lines.${index}.quantity`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...form.register(`lines.${index}.unitPrice`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...form.register(`lines.${index}.discount`, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                </td>
                                                <td className="p-3 font-mono font-medium pt-5">
                                                    {lineTotal.toFixed(2)}
                                                </td>
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
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={8} className="p-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-primary"
                                                onClick={() =>
                                                    append({
                                                        itemId: "",
                                                        description: "",
                                                        quantity: 1,
                                                        unitPrice: 0,
                                                        discount: 0,
                                                    })
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> إضافة سطر جديد
                                            </Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/10">
                    <CardContent className="p-6 flex flex-col items-end gap-2">
                        <div className="flex justify-between w-full md:w-1/3 text-lg font-bold">
                            <span>الإجمالي</span>
                            <span>
                                {totalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                                د.ل
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
