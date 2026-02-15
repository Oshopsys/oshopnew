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
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { createCapitalAccount } from "@/app/actions/capital";

const capitalAccountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
    initialBalance: z.number().optional(),
});

type CapitalAccountFormValues = z.infer<typeof capitalAccountSchema>;

interface CapitalAccountFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    accountId?: string;
}

export default function CapitalAccountForm({
    initialData,
    mode = "create",
    accountId,
}: CapitalAccountFormProps) {
    const router = useRouter();

    const defaultValues: CapitalAccountFormValues = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            initialBalance: initialData.initial_balance || 0,
        }
        : {
            name: "",
            code: "",
            initialBalance: 0,
        };

    const form = useForm<CapitalAccountFormValues>({
        resolver: zodResolver(capitalAccountSchema),
        defaultValues,
    });

    async function onSubmit(data: CapitalAccountFormValues) {
        try {
            if (mode === "edit" && accountId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                await createCapitalAccount(data);
                console.log("Created Capital Account Successfully");
                router.push("/capital-accounts");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create capital account");
        }
    }

    function handleCancel() {
        if (mode === "edit" && accountId) {
            router.push(`/capital-accounts/${accountId}`);
        } else {
            router.push("/capital-accounts");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل حساب رأس مال" : "حساب رأس مال جديد"}
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
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الاسم (الشريك/المالك)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="فلان الفلاني" {...field} />
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
                                            <Input placeholder="C-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="initialBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرصيد الافتتاحي</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("initialBalance", {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
