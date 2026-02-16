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
import { SUPPLIERS } from "@/lib/mock-data";
import { createPartner, updatePartner } from "@/app/actions/partners";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    currency: z.string(),
    creditLimit: z.number().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    supplierId?: string;
}

export default function SupplierForm({
    initialData,
    mode = "create",
    supplierId,
}: SupplierFormProps) {
    const router = useRouter();

    const defaultValues: SupplierFormValues = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            email: initialData.email || "",
            address: initialData.address || "",
            taxIdentificationNumber: initialData.taxIdentificationNumber || "",
            currency: initialData.currency || "LYD",
            creditLimit: initialData.creditLimit || 0,
        }
        : {
            name: "",
            code: "",
            email: "",
            address: "",
            taxIdentificationNumber: "",
            currency: "LYD",
            creditLimit: 0,
        };

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues,
    });

    async function onSubmit(data: SupplierFormValues) {
        try {
            if (mode === "edit" && supplierId) {
                await updatePartner(supplierId, {
                    ...data,
                    type: 'SUPPLIER'
                });
                console.log("Updated Supplier:", data);
                router.push(`/suppliers/${supplierId}`);
                router.refresh();
            } else {
                await createPartner({
                    ...data,
                    type: 'SUPPLIER'
                });
                console.log("Created Supplier:", data);
                router.push("/suppliers");
                router.refresh();
            }
        } catch (error) {
            console.error("Error saving supplier:", error);
            // You might want to show a toast error here
        }
    }

    function handleCancel() {
        if (mode === "edit" && supplierId) {
            router.push(`/suppliers/${supplierId}`);
        } else {
            router.push("/suppliers");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل بيانات المورد" : "مورد جديد"}
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
                                            <Input placeholder="اسم المورد / الشركة" {...field} />
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
                                            <Input placeholder="SUP-XXXX" {...field} />
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
                                                placeholder="supplier@example.com"
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
                                        <FormLabel>الرقم الضريبي</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>العنوان</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="عنوان المورد..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
