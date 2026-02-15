"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const businessDetailsSchema = z.object({
    businessName: z.string().min(1, "Business Name is required"),
    address: z.string().optional(),
    contactInfo: z.string().optional(),
    taxNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
});

type BusinessDetailsFormValues = z.infer<typeof businessDetailsSchema>;

const defaultValues: BusinessDetailsFormValues = {
    businessName: "Oshop - ( فرع مصراته )",
    address: "مصراتة، ليبيا",
    contactInfo: "091-XXXXXXX",
    taxNumber: "TAX-123456789",
    email: "info@oshop.ly",
};

export default function BusinessDetailsPage() {
    const form = useForm<BusinessDetailsFormValues>({
        resolver: zodResolver(businessDetailsSchema),
        defaultValues,
    });

    function onSubmit(data: BusinessDetailsFormValues) {
        console.log("Submitted:", data);
        alert("Settings Saved!\n" + JSON.stringify(data, null, 2));
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">تفاصيل العمل التجاري</h1>
                <Button onClick={form.handleSubmit(onSubmit)}><Save className="ml-2 h-4 w-4" /> حفظ التغييرات</Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>معلومات أساسية</CardTitle>
                            <CardDescription>هذه المعلومات ستظهر على الفواتير والمستندات المطبوعة.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اسم العمل التجاري</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                            <Textarea placeholder="العنوان بالتفصيل..." className="min-h-[100px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>معلومات الاتصال</FormLabel>
                                            <FormControl>
                                                <Input placeholder="هاتف / فاكس" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الرقم الضريبي</FormLabel>
                                            <FormControl>
                                                <Input placeholder="الرقم الضريبي" {...field} />
                                            </FormControl>
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
                                            <Input type="email" placeholder="email@business.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
