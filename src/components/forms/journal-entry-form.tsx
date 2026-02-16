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
import { JOURNAL_ENTRIES, ACCOUNTS } from "@/lib/mock-data";

const journalSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    narrative: z.string().min(1, "Narrative is required"),
    lines: z.array(
        z.object({
            accountId: z.string().min(1, "Account is required"),
            description: z.string().optional(),
            debit: z.number().min(0),
            credit: z.number().min(0),
        })
    ).min(2, "At least two lines are required"),
});

type JournalFormValues = z.infer<typeof journalSchema>;

interface JournalEntryFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    entryId?: string;
}

export default function JournalEntryForm({
    initialData,
    mode = "create",
    entryId,
}: JournalEntryFormProps) {
    const router = useRouter();

    const defaultValues: JournalFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            narrative: initialData.description || "", // Map description to narrative
            lines: initialData.lines || [
                { accountId: "", description: "", debit: 0, credit: 0 },
                { accountId: "", description: "", debit: 0, credit: 0 }
            ],
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            narrative: "",
            lines: [
                { accountId: "", description: "", debit: 0, credit: 0 },
                { accountId: "", description: "", debit: 0, credit: 0 }
            ],
        };

    const form = useForm<JournalFormValues>({
        resolver: zodResolver(journalSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "lines",
        control: form.control,
    });

    const lines = useWatch({ control: form.control, name: "lines" });

    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const difference = totalDebit - totalCredit;

    function onSubmit(data: JournalFormValues) {
        if (Math.abs(difference) > 0.01) {
            alert("لا يمكن الحفظ: القيد غير متزن.");
            return;
        }

        const enrichedLines = data.lines.map(line => {
            const account = ACCOUNTS.find((a: any) => a.id === line.accountId);
            return {
                ...line,
                accountCode: account?.code || "",
                accountName: account?.name || "",
                description: line.description || ""
            };
        });

        if (mode === "edit" && entryId) {
            // TODO: Replace with API call
            const index = JOURNAL_ENTRIES.findIndex((e: any) => e.id === entryId);
            if (index > -1) {
                JOURNAL_ENTRIES[index] = {
                    ...JOURNAL_ENTRIES[index],
                    ...data,
                    lines: enrichedLines,
                    description: data.narrative // Map back narrative to description
                };
            }
            console.log("Updated Journal Entry:", data);
            router.push(`/journal-entries/${entryId}`);
        } else {
            // TODO: Replace with API call
            const newEntry = {
                id: `JRN-${String(JOURNAL_ENTRIES.length + 1).padStart(3, '0')}`,
                ...data,
                lines: enrichedLines,
                description: data.narrative,
                isPosted: false // Default status
            };
            JOURNAL_ENTRIES.push(newEntry as any);
            console.log("Created Journal Entry:", data);
            router.push("/journal-entries");
        }
    }

    function handleCancel() {
        if (mode === "edit" && entryId) {
            router.push(`/journal-entries/${entryId}`);
        } else {
            router.push("/journal-entries");
        }
    }

    const accountOptions = ACCOUNTS.map(a => ({
        value: a.id,
        label: `${a.code} - ${a.name}`
    }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل قيد محاسبي" : "قيد محاسبي جديد"}
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
                                        <Input placeholder="مرجع القيد" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="narrative"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>الشرح</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="شرح القيد..." {...field} />
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
                                        <th className="p-3 w-[300px]">الحساب</th>
                                        <th className="p-3">شرح السطر</th>
                                        <th className="p-3 w-[150px]">مدين</th>
                                        <th className="p-3 w-[150px]">دائن</th>
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
                                                    options={accountOptions}
                                                    value={form.watch(`lines.${index}.accountId`) || ""}
                                                    onChange={(val) =>
                                                        form.setValue(`lines.${index}.accountId`, val)
                                                    }
                                                    placeholder="اختر حساب..."
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    {...form.register(`lines.${index}.description`)}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`lines.${index}.debit`, {
                                                        valueAsNumber: true,
                                                    })}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`lines.${index}.credit`, {
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
                                        <td colSpan={6} className="p-2 border-t">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-primary"
                                                onClick={() =>
                                                    append({
                                                        accountId: "",
                                                        description: "",
                                                        debit: 0,
                                                        credit: 0,
                                                    })
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> إضافة سطر
                                            </Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/10">
                    <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-muted-foreground text-sm">إجمالي المدين</div>
                            <div className="font-bold font-mono text-lg">
                                {totalDebit.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm">إجمالي الدائن</div>
                            <div className="font-bold font-mono text-lg">
                                {totalCredit.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </div>
                        </div>
                        <div
                            className={`col-span-2 md:col-span-2 flex items-center justify-center p-2 rounded ${Math.abs(difference) < 0.01
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {Math.abs(difference) < 0.01 ? (
                                <span className="font-bold">متزن</span>
                            ) : (
                                <span className="font-bold">
                                    غير متزن ( الفرق: {difference.toFixed(2)} )
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
