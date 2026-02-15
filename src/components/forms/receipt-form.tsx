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
import { createReceipt } from "@/app/actions/treasury";

const receiptSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    payerId: z.string().optional(),
    receivedInAccountId: z.string().min(1, "Account is required"),
    description: z.string().optional(),
    lines: z.array(
        z.object({
            accountId: z.string().min(1, "Account is required"),
            description: z.string().optional(),
            amount: z.number().min(0, "Amount must be positive"),
        })
    ).min(1, "At least one line is required"),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    receiptId?: string;
    bankAccounts: { id: string; name: string }[];
    customers: { id: string; name: string }[];
    accounts: { id: string; name: string; code: string; type?: string }[];
}

export default function ReceiptForm({
    initialData,
    mode = "create",
    receiptId,
    bankAccounts = [],
    customers = [],
    accounts = []
}: ReceiptFormProps) {
    const router = useRouter();

    const defaultValues: ReceiptFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            payerId: initialData.partner_id || "",
            receivedInAccountId: initialData.receivedInAccountId || "",
            description: initialData.description || "",
            lines: initialData.lines || [{ accountId: "", description: "", amount: 0 }],
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            payerId: "",
            receivedInAccountId: "",
            description: "",
            lines: [{ accountId: "", description: "", amount: 0 }],
        };

    const form = useForm<ReceiptFormValues>({
        resolver: zodResolver(receiptSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "lines",
        control: form.control,
    });

    const lines = useWatch({ control: form.control, name: "lines" });
    const totalAmount = lines.reduce((sum, line) => sum + (line.amount || 0), 0);

    async function onSubmit(data: ReceiptFormValues) {
        try {
            if (mode === "edit" && receiptId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                const receiptData = {
                    date: new Date(data.date).toISOString(),
                    reference: data.reference,
                    bank_account_id: data.receivedInAccountId,
                    partner_id: data.payerId || null,
                    description: data.description,
                    amount: totalAmount
                };

                const receiptLines = data.lines.map(line => ({
                    account_id: line.accountId,
                    description: line.description,
                    amount: line.amount
                }));

                await createReceipt(receiptData, receiptLines);

                console.log("Created Receipt Successfully");
                router.push("/receipts");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create receipt");
        }
    }

    function handleCancel() {
        if (mode === "edit" && receiptId) {
            router.push(`/receipts/${receiptId}`);
        } else {
            router.push("/receipts");
        }
    }

    const accountOptions = accounts.map((a) => ({
        value: a.id,
        label: `${a.code} - ${a.name}`,
    }));

    const bankAccountOptions = bankAccounts.map((b) => ({
        value: b.id,
        label: b.name,
    }));

    const customerOptions = customers.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل سند قبض" : "سند قبض جديد"}
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
                    <CardContent className="p-6 grid gap-6 md:grid-cols-2">
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
                                        <Input placeholder="رقم المرجع" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="receivedInAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>حساب القبض (استلام في)</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={bankAccountOptions}
                                            value={field.value}
                                            onChange={(val) => field.onChange(val)}
                                            placeholder="اختر حساب بنك/خزينة..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="payerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>جهة الدفع (اختياري)</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={customerOptions}
                                            value={field.value || ""}
                                            onChange={(val) => field.onChange(val)}
                                            placeholder="اختر عميل..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>البيان</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="وصف عام للسند..." {...field} />
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
                                        <th className="p-3 w-[300px]">الحساب (إيراد/ذمم)</th>
                                        <th className="p-3">الوصف</th>
                                        <th className="p-3 w-[150px]">المبلغ</th>
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
                                                    options={accountOptions}
                                                    value={form.watch(`lines.${index}.accountId`) || ""}
                                                    onChange={(val) =>
                                                        form.setValue(`lines.${index}.accountId`, val)
                                                    }
                                                    placeholder="اختر حساب..."
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
                                                    step="0.01"
                                                    {...form.register(`lines.${index}.amount`, {
                                                        valueAsNumber: true,
                                                    })}
                                                />
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
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="p-2 border-t">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-primary"
                                                onClick={() =>
                                                    append({ accountId: "", description: "", amount: 0 })
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> إضافة سطر
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
                                })}{" "}
                                د.ل
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
