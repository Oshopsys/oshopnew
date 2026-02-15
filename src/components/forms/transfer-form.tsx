"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
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
import { createTransfer } from "@/app/actions/treasury";

const transferSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    paidFromAccountId: z.string().min(1, "Source Account is required"),
    receivedInAccountId: z.string().min(1, "Destination Account is required"),
    amount: z.number().min(0.01, "Amount is required"),
    description: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface TransferFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    transferId?: string;
    bankAccounts: any[]; // Pass bank accounts as prop
}

export default function TransferForm({
    initialData,
    mode = "create",
    transferId,
    bankAccounts = [],
}: TransferFormProps) {
    const router = useRouter();

    const defaultValues: TransferFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            paidFromAccountId: initialData.bank_account_id || "", // Adjusted mapping
            receivedInAccountId: "", // Can't easily map back from single transaction record without join
            amount: initialData.amount || 0,
            description: initialData.description || "",
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            paidFromAccountId: "",
            receivedInAccountId: "",
            amount: 0,
            description: "",
        };

    const form = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues,
    });

    async function onSubmit(data: TransferFormValues) {
        if (data.paidFromAccountId === data.receivedInAccountId) {
            form.setError("receivedInAccountId", {
                message: "Cannot transfer to the same account",
            });
            return;
        }

        try {
            if (mode === "edit" && transferId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                await createTransfer(data);
                console.log("Created Transfer Successfully");
                router.push("/inter-account-transfers");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create transfer");
        }
    }

    function handleCancel() {
        if (mode === "edit" && transferId) {
            router.push(`/inter-account-transfers/${transferId}`);
        } else {
            router.push("/inter-account-transfers");
        }
    }

    const accountOptions = bankAccounts.map((a) => ({
        value: a.id,
        label: `${a.code || ''} - ${a.name}`,
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل تحويل" : "تحويل بين الحسابات جديد"}
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
                                            <Input placeholder="مرجع التحويل" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border">
                            <FormField
                                control={form.control}
                                name="paidFromAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>مدفوع من</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={accountOptions}
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="اختر حساب المصدر..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>المبلغ</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("amount", { valueAsNumber: true })}
                                                className="font-bold text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border">
                            <FormField
                                control={form.control}
                                name="receivedInAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>حساب القبض (استلام في)</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={accountOptions}
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="اختر حساب الوجهة..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center text-muted-foreground text-sm">
                                سيتم إيداع المبلغ في هذا الحساب.
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>البيان</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="وصف للتحويل..." {...field} />
                                    </FormControl>
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
