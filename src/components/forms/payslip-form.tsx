"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Save } from "lucide-react";
import { format } from "date-fns";
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
import { Combobox } from "@/components/ui/combobox";
import { EMPLOYEES, PAY_ITEMS, PAYSLIPS } from "@/lib/mock-data";

const payslipSchema = z.object({
    date: z.string(),
    reference: z.string().optional(),
    employeeId: z.string().min(1, "Employee is required"),
    description: z.string().optional(),
    earnings: z.array(
        z.object({
            itemId: z.string().min(1, "Item is required"),
            description: z.string().optional(),
            amount: z.number().min(0),
        })
    ),
    deductions: z.array(
        z.object({
            itemId: z.string().min(1, "Item is required"),
            description: z.string().optional(),
            amount: z.number().min(0),
        })
    )
});

type PayslipFormValues = z.infer<typeof payslipSchema>;

interface PayslipFormProps {
    initialData?: any;
    mode?: "create" | "edit";
    payslipId?: string;
}

export default function PayslipForm({
    initialData,
    mode = "create",
    payslipId,
}: PayslipFormProps) {
    const router = useRouter();

    // Helper to find employee ID by name if needed (legacy mock data support)
    const findEmployeeId = (nameOrId: string) => {
        const empById = EMPLOYEES.find(e => e.id === nameOrId);
        if (empById) return empById.id;
        const empByName = EMPLOYEES.find(e => e.name === nameOrId);
        return empByName ? empByName.id : "";
    };

    const defaultValues: PayslipFormValues = initialData
        ? {
            date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            reference: initialData.reference || "",
            employeeId: findEmployeeId(initialData.employee),
            description: initialData.description || "",
            // Adapt simple mock data to array structure
            earnings: Array.isArray(initialData.earnings)
                ? initialData.earnings
                : typeof initialData.earnings === 'number'
                    ? [{ itemId: "1", amount: initialData.earnings }]
                    : [{ itemId: "1", amount: 0 }],
            deductions: Array.isArray(initialData.deductions)
                ? initialData.deductions
                : typeof initialData.deductions === 'number' && initialData.deductions > 0
                    ? [{ itemId: "3", amount: initialData.deductions }]
                    : []
        }
        : {
            date: format(new Date(), "yyyy-MM-dd"),
            reference: "",
            employeeId: "",
            description: "",
            earnings: [
                { itemId: "1", amount: 0 }
            ],
            deductions: []
        };

    const form = useForm<PayslipFormValues>({
        resolver: zodResolver(payslipSchema),
        defaultValues,
    });

    const { fields: earningFields, append: appendEarning, remove: removeEarning } = useFieldArray({
        name: "earnings",
        control: form.control,
    });

    const { fields: deductionFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({
        name: "deductions",
        control: form.control,
    });

    const earnings = useWatch({ control: form.control, name: "earnings" });
    const deductions = useWatch({ control: form.control, name: "deductions" });

    const totalEarnings = earnings?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const totalDeductions = deductions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const netPay = totalEarnings - totalDeductions;

    function onSubmit(data: PayslipFormValues) {
        // Find employee name for legacy support
        const employee = EMPLOYEES.find(e => e.id === data.employeeId);
        const employeeName = employee ? employee.name : data.employeeId;

        if (mode === "edit" && payslipId) {
            // TODO: Replace with API call
            const index = PAYSLIPS.findIndex((p: any) => p.id === payslipId);
            if (index > -1) {
                PAYSLIPS[index] = {
                    ...PAYSLIPS[index],
                    ...data,
                    employee: employeeName,
                    earnings: totalEarnings, // Save as total for compatibility
                    deductions: totalDeductions,
                    netPay: netPay,
                    // Also save detailed arrays if we extend the mock data structure
                    earningsDetails: data.earnings,
                    deductionsDetails: data.deductions
                };
            }
            console.log("Updated Payslip:", data);
            router.push(`/payslips/${payslipId}`);
        } else {
            // TODO: Replace with API call
            const newPayslip = {
                id: `PS-${String(PAYSLIPS.length + 1).padStart(3, '0')}`,
                ...data,
                employee: employeeName,
                earnings: totalEarnings,
                deductions: totalDeductions,
                netPay: netPay
            };
            PAYSLIPS.push(newPayslip);
            console.log("Created Payslip:", data);
            router.push("/payslips");
        }
    }

    function handleCancel() {
        if (mode === "edit" && payslipId) {
            router.push(`/payslips/${payslipId}`);
        } else {
            router.push("/payslips");
        }
    }

    const employeeOptions = EMPLOYEES.map(e => ({ value: e.id, label: `${e.code} - ${e.name}` }));
    const earningItemsOptions = PAY_ITEMS.filter(i => i.type === 'Earning').map(i => ({ value: i.id, label: i.name }));
    const deductionItemsOptions = PAY_ITEMS.filter(i => i.type === 'Deduction').map(i => ({ value: i.id, label: i.name }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {mode === "edit" ? "تعديل قسيمة راتب" : "قسيمة راتب جديدة"}
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
                                        <Input placeholder="REF" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الموظف</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={employeeOptions}
                                            value={field.value}
                                            onChange={(val) => field.onChange(val)}
                                            placeholder="اختر موظف..."
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
                                        <Input placeholder="راتب شهر ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Earnings Section */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 bg-green-50/50 font-semibold border-b text-green-700">مستحقات (Earnings)</div>
                            <div className="p-2">
                                <table className="w-full text-sm text-right">
                                    <tbody className="divide-y">
                                        {earningFields.map((field, index) => (
                                            <tr key={field.id} className="group hover:bg-muted/30 align-top">
                                                <td className="p-2">
                                                    <Combobox
                                                        options={earningItemsOptions}
                                                        value={form.watch(`earnings.${index}.itemId`) || ""}
                                                        onChange={(val) => form.setValue(`earnings.${index}.itemId`, val)}
                                                        placeholder="بند استحقاق..."
                                                    />
                                                </td>
                                                <td className="p-2 w-[120px]">
                                                    <Input type="number" placeholder="0.00" {...form.register(`earnings.${index}.amount`, { valueAsNumber: true })} />
                                                </td>
                                                <td className="p-2 w-[40px]">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEarning(index)} className="text-destructive h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="p-2">
                                                <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => appendEarning({ itemId: "", amount: 0 })}>
                                                    <Plus className="mr-2 h-4 w-4" /> إضافة استحقاق
                                                </Button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deductions Section */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 bg-red-50/50 font-semibold border-b text-red-700">استقطاعات (Deductions)</div>
                            <div className="p-2">
                                <table className="w-full text-sm text-right">
                                    <tbody className="divide-y">
                                        {deductionFields.map((field, index) => (
                                            <tr key={field.id} className="group hover:bg-muted/30 align-top">
                                                <td className="p-2">
                                                    <Combobox
                                                        options={deductionItemsOptions}
                                                        value={form.watch(`deductions.${index}.itemId`) || ""}
                                                        onChange={(val) => form.setValue(`deductions.${index}.itemId`, val)}
                                                        placeholder="بند خصم..."
                                                    />
                                                </td>
                                                <td className="p-2 w-[120px]">
                                                    <Input type="number" placeholder="0.00" {...form.register(`deductions.${index}.amount`, { valueAsNumber: true })} />
                                                </td>
                                                <td className="p-2 w-[40px]">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(index)} className="text-destructive h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="p-2">
                                                <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => appendDeduction({ itemId: "", amount: 0 })}>
                                                    <Plus className="mr-2 h-4 w-4" /> إضافة خصم
                                                </Button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-muted/10">
                    <CardContent className="p-6 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-muted-foreground text-sm">إجمالي المستحقات</div>
                            <div className="font-bold text-lg text-green-600">{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm">إجمالي الإستقطاعات</div>
                            <div className="font-bold text-lg text-red-600">{totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-background rounded-lg border p-2 shadow-sm">
                            <div className="text-muted-foreground text-sm">صافي الراتب</div>
                            <div className="font-bold text-xl">{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
