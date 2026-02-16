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
import { createAmortizationEntry } from "@/app/actions/assets";

const amortizationSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    description: z.string().optional(),
    lines: z.array(
        z.object({
            assetId: z.string().min(1, "Asset is required"),
            amount: z.number().min(0.01),
        })
    ).min(1, "At least one line is required"),
});

type AmortizationFormValues = z.infer<typeof amortizationSchema>;

interface AmortizationEntryFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    entryId?: string;
    assets?: { id: string; name: string; code: string }[];
}

export default function AmortizationEntryForm({
    initialData,
    mode = "create",
    entryId,
    assets = [],
}: AmortizationEntryFormProps) {
    const router = useRouter();

    const defaultValues: AmortizationFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            description: initialData.description || "",
            lines: initialData.lines || [
                { assetId: "", amount: initialData.amount || 0 }
            ],
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            description: "",
            lines: [
                { assetId: "", amount: 0 }
            ],
        };

    const form = useForm<AmortizationFormValues>({
        resolver: zodResolver(amortizationSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "lines",
        control: form.control,
    });

    const lines = useWatch({ control: form.control, name: "lines" });
    const totalAmount = lines?.reduce((sum, line) => sum + (line.amount || 0), 0) || 0;

    async function onSubmit(data: AmortizationFormValues) {
        try {
            if (mode === "edit" && entryId) {
                // TODO: Replace with API call
                alert("Edit functionality coming soon");
            } else {
                await createAmortizationEntry(data, data.lines);
                console.log("Created Amortization Entry Successfully");
                router.push("/amortization-entries");
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create amortization entry");
        }
    }

    function handleCancel() {
        if (mode === "edit" && entryId) {
            router.push(`/amortization-entries/${entryId}`);
        } else {
            router.push("/amortization-entries");
        }
    }

    const assetOptions = assets.map(a => ({ value: a.id, label: `${a.code || '-'} - ${a.name}` }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل قيد إطفاء" : "قيد إطفاء أصول جديد"}
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
                                        <Input placeholder="AMR-XXX" {...field} />
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
                                        <Textarea placeholder="وصف للقيد..." {...field} />
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
                                        <th className="p-3 w-[300px]">الأصل غير الملموس</th>
                                        <th className="p-3 w-[200px]">قيمة الإطفاء</th>
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
                                                    options={assetOptions}
                                                    value={form.watch(`lines.${index}.assetId`) || ""}
                                                    onChange={(val) =>
                                                        form.setValue(`lines.${index}.assetId`, val)
                                                    }
                                                    placeholder="اختر أصل..."
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
                                        <td colSpan={4} className="p-2 border-t">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-primary"
                                                onClick={() => append({ assetId: "", amount: 0 })}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> إضافة أصل
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
                            <span>إجمالي الإطفاء</span>
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
