"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createAccount, updateAccount } from "@/app/actions/accounting";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const accountSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
    parent_id: z.string().optional(),
    description: z.string().optional(),
    is_group: z.boolean().default(false),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface ChartOfAccountsFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    accountId?: string;
    onSuccess?: () => void;
    parents?: { id: string; name: string; code?: string }[];
}

export default function ChartOfAccountsForm({
    initialData,
    mode = "create",
    accountId,
    onSuccess,
    parents = []
}: ChartOfAccountsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const defaultValues: AccountFormValues = initialData
        ? {
            code: initialData.code,
            name: initialData.name,
            type: initialData.type,
            parent_id: initialData.parent_id || undefined,
            description: initialData.description || "",
            is_group: initialData.is_group || false,
        }
        : {
            code: "",
            name: "",
            type: "ASSET",
            parent_id: undefined,
            description: "",
            is_group: false,
        };

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues,
    });

    const onSubmit = async (data: AccountFormValues) => {
        setLoading(true);
        try {
            if (mode === "edit" && accountId) {
                await updateAccount(accountId, data);
            } else {
                await createAccount(data);
            }
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء حفظ الحساب");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>نوع الحساب</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر النوع" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ASSET">أصول (Assets)</SelectItem>
                                    <SelectItem value="LIABILITY">التزامات (Liabilities)</SelectItem>
                                    <SelectItem value="EQUITY">حقوق ملكية (Equity)</SelectItem>
                                    <SelectItem value="REVENUE">إيرادات (Income)</SelectItem>
                                    <SelectItem value="EXPENSE">مصروفات (Expenses)</SelectItem>
                                </SelectContent>
                            </Select>
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
                                <FormLabel>كود الحساب</FormLabel>
                                <FormControl>
                                    <Input placeholder="مثال: 101" {...field} />
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
                                <FormLabel>اسم الحساب</FormLabel>
                                <FormControl>
                                    <Input placeholder="مثال: النقدية" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>الحساب الرئيسي (اختياري)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر حساب رئيسي" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {parents.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.code ? `${p.code} - ` : ''}{p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>اتركه فارغاً إذا كان حساب رئيسي</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_group"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-x-reverse rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none mr-2">
                                <FormLabel>
                                    مجموعة حسابات؟
                                </FormLabel>
                                <FormDescription>
                                    حدد هذا الخيار إذا كان هذا الحساب سيحتوي على حسابات فرعية.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>وصف</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "جاري الحفظ..." : (mode === "edit" ? "تحديث" : "إنشاء")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
