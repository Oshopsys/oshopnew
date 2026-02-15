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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEmployee, updateEmployee } from "@/app/actions/hr";

const employeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
    position: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    status: z.enum(["ACTIVE", "TERMINATED", "ON_LEAVE"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    employeeId?: string;
}

export default function EmployeeForm({
    initialData,
    mode = "create",
    employeeId,
}: EmployeeFormProps) {
    const router = useRouter();

    const defaultValues: EmployeeFormValues = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            position: initialData.position || "",
            email: initialData.email || "",
            address: initialData.address || "",
            status: initialData.status as "ACTIVE" | "TERMINATED" | "ON_LEAVE" || "ACTIVE",
        }
        : {
            name: "",
            code: "",
            position: "",
            email: "",
            address: "",
            status: "ACTIVE",
        };

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues,
    });

    async function onSubmit(data: EmployeeFormValues) {
        try {
            if (mode === "edit" && employeeId) {
                await updateEmployee(employeeId, data);
                // alert("تم تحديث بيانات الموظف بنجاح");
                router.push(`/employees/${employeeId}`);
                router.refresh();
            } else {
                await createEmployee({
                    ...data,
                    code: data.code || `EMP-${Date.now()}`,
                });
                // alert("تم إضافة الموظف بنجاح");
                router.push("/employees");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء حفظ البيانات");
        }
    }

    function handleCancel() {
        if (mode === "edit" && employeeId) {
            router.push(`/employees/${employeeId}`);
        } else {
            router.push("/employees");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل بيانات موظف" : "موظف جديد"}
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
                                        <FormLabel>الاسم الكامل</FormLabel>
                                        <FormControl>
                                            <Input placeholder="اسم الموظف" {...field} />
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
                                        <FormLabel>الرمز الوظيفي</FormLabel>
                                        <FormControl>
                                            <Input placeholder="E-00X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>المسمى الوظيفي</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: محاسب، مدير مبيعات" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                <SelectItem value="ACTIVE">نشط</SelectItem>
                                                <SelectItem value="ON_LEAVE">إجازة</SelectItem>
                                                <SelectItem value="TERMINATED">منتهي</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>البريد الإلكتروني</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>العنوان</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="العنوان السكني..." {...field} />
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
