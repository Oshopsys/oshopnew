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
import { createFixedAsset } from "@/app/actions/assets";

const fixedAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
    depreciationRate: z.number().min(0).optional(),
    description: z.string().optional(),
    acquisitionCost: z.number().min(0).optional(),
});

type FixedAssetFormValues = z.infer<typeof fixedAssetSchema>;

interface FixedAssetFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    assetId?: string;
}

export default function FixedAssetForm({
    initialData,
    mode = "create",
    assetId,
}: FixedAssetFormProps) {
    const router = useRouter();

    const defaultValues: FixedAssetFormValues = initialData
        ? {
            name: initialData.name || "",
            code: initialData.code || "",
            depreciationRate: initialData.depreciation_rate || 0,
            description: initialData.description || "",
            acquisitionCost: initialData.purchase_cost || 0,
        }
        : {
            name: "",
            code: "",
            depreciationRate: 0,
            description: "",
            acquisitionCost: 0,
        };

    const form = useForm<FixedAssetFormValues>({
        resolver: zodResolver(fixedAssetSchema),
        defaultValues,
    });

    async function onSubmit(data: FixedAssetFormValues) {
        try {
            if (mode === "edit" && assetId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                await createFixedAsset(data);
                console.log("Created Fixed Asset Successfully");
                router.push("/fixed-assets");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create fixed asset");
        }
    }

    function handleCancel() {
        if (mode === "edit" && assetId) {
            router.push(`/fixed-assets/${assetId}`);
        } else {
            router.push("/fixed-assets");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل أصل ثابت" : "أصل ثابت جديد"}
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
                                        <FormLabel>اسم الأصل</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: سيارة تويوتا" {...field} />
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
                                        <FormLabel>الرمز</FormLabel>
                                        <FormControl>
                                            <Input placeholder="FA-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="depreciationRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>معدل الإهلاك السنوي (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="20"
                                            {...form.register("depreciationRate", {
                                                valueAsNumber: true,
                                            })}
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
                                <FormItem>
                                    <FormLabel>البيان</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="وصف للأصل..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted/20 p-4 rounded-md border">
                            <FormField
                                control={form.control}
                                name="acquisitionCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>تكلفة الاقتناء (الرصيد الافتتاحي)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("acquisitionCost", {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                ملاحظة: عادة ما يتم تحديد التكلفة عبر فواتير الشراء، ولكن يمكنك
                                إدخال رصيد افتتاحي هنا.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
