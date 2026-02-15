"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createBankAccount, updateBankAccount } from "@/app/actions/treasury";

const bankAccountSchema = z.object({
    name: z.string().min(1, "الاسم مطلوب"),
    code: z.string().optional(),
    accountNumber: z.string().optional(),
    currency: z.enum(["LYD", "USD", "EUR"]),
    balance: z.number().min(0, "الرصيد يجب أن يكون صفر أو أكثر"),
    glAccountId: z.string().min(1, "يجب اختيار حساب الدفتر العام"),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    accountId?: string;
    accounts?: { id: string; name: string; code?: string }[];
}

export default function BankAccountForm({
    initialData,
    mode = "create",
    accountId,
    accounts = [],
}: BankAccountFormProps) {
    const router = useRouter();

    const defaultValues: BankAccountFormData = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            accountNumber: initialData.accountNumber || "",
            currency: (initialData.currency as "LYD" | "USD" | "EUR") || "LYD",
            balance: initialData.balance || 0,
            glAccountId: initialData.gl_account_id || undefined,
        }
        : {
            name: "",
            code: "",
            accountNumber: "",
            currency: "LYD",
            balance: 0,
            glAccountId: undefined,
        };

    const form = useForm<BankAccountFormData>({
        resolver: zodResolver(bankAccountSchema),
        defaultValues,
    });

    const onSubmit = async (data: BankAccountFormData) => {
        const payload = {
            name: data.name,
            code: data.code,
            account_number: data.accountNumber,
            currency: data.currency,
            gl_account_id: data.glAccountId,
        };

        try {
            if (mode === "edit" && accountId) {
                await updateBankAccount(accountId, payload);
                // alert("تم تحديث الحساب بنجاح");
                router.push(`/bank-accounts/${accountId}`);
                router.refresh();
            } else {
                await createBankAccount({
                    ...payload,
                    code: data.code || `BNK-${Date.now()}`,
                });
                // alert("تم إنشاء الحساب بنجاح");
                router.push("/bank-accounts");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء حفظ البيانات");
        }
    };

    const handleCancel = () => {
        if (mode === "edit" && accountId) {
            router.push(`/bank-accounts/${accountId}`);
        } else {
            router.push("/bank-accounts");
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>اسم الحساب *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="مثال: البنك الأهلي - فرع طرابلس" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرمز</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: BNK-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>رقم الحساب</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: 1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العملة *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر العملة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LYD">دينار ليبي (LYD)</SelectItem>
                                                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرصيد الافتتاحي *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            الرصيد الحالي للحساب
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {accounts.length > 0 && (
                            <FormField
                                control={form.control}
                                name="glAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>حساب الدفتر العام المرتبط</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر حساب..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.code ? `${acc.code} - ` : ''}{acc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            الحساب المحاسبي الذي ستنعكس عليه حركات هذا الحساب البنكي.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                إلغاء
                            </Button>
                            <Button type="submit">
                                <Save className="ml-2 h-4 w-4" />
                                {mode === "edit" ? "حفظ التعديلات" : "إنشاء"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
