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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPartner, updatePartner } from "@/app/actions/partners";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    billingAddress: z.string().optional(),
    deliveryAddress: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    currency: z.string(),
    creditLimit: z.number().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    customerId?: string;
}

export default function CustomerForm({
    initialData,
    mode = "create",
    customerId,
}: CustomerFormProps) {
    const router = useRouter();

    const defaultValues: Partial<CustomerFormValues> = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            email: initialData.email || "",
            billingAddress: initialData.billingAddress || "",
            deliveryAddress: initialData.deliveryAddress || "",
            taxIdentificationNumber: initialData.taxIdentificationNumber || "",
            currency: initialData.currency || "LYD",
            creditLimit: initialData.creditLimit || 0,
        }
        : {
            name: "",
            code: "",
            email: "",
            billingAddress: "",
            deliveryAddress: "",
            taxIdentificationNumber: "",
            currency: "LYD",
            creditLimit: 0,
        };

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues,
    });

    async function onSubmit(data: CustomerFormValues) {
        try {
            if (mode === "edit" && customerId) {
                await updatePartner(customerId, data);
                router.push(`/customers/${customerId}`);
                router.refresh();
            } else {
                await createPartner(data);
                router.push("/customers");
                router.refresh();
            }
        } catch (error) {
            console.error("Error saving customer:", error);
            alert("حدث خطأ أثناء حفظ بيانات العميل");
        }
    }

    function handleCancel() {
        if (mode === "edit" && customerId) {
            router.push(`/customers/${customerId}`);
        } else {
            router.push("/customers");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل بيانات العميل" : "عميل جديد"}
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم</FormLabel>
                                        <FormControl>
                                            <Input placeholder="اسم العميل / الشركة" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرمز (اختياري)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="C-XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="client@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxIdentificationNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرقم الضريبي (إن وجد)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border">
                            <FormField
                                control={form.control}
                                name="billingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>عنوان الفوترة</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="العنوان التجاري للعميل..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="deliveryAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>عنوان التسليم</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="عنوان المخزن / الاستلام..."
                                                className="min-h-[80px]"
                                                {...field}
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
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العملة</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر العملة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LYD">دينار ليبي (LYD)</SelectItem>
                                                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="creditLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الحد الإئتماني</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="100"
                                                placeholder="0.00"
                                                {...form.register("creditLimit", {
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
