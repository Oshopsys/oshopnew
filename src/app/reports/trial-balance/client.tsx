"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrialBalanceEntry {
    account_code: string;
    account_name: string;
    total_debit: number;
    total_credit: number;
}

interface TrialBalanceClientProps {
    initialData: TrialBalanceEntry[];
    defaultDate: string;
}

export default function TrialBalanceClient({
    initialData,
    defaultDate
}: TrialBalanceClientProps) {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date(defaultDate));

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (date) params.set("date", format(date, "yyyy-MM-dd"));

        router.push(`/reports/trial-balance?${params.toString()}`);
    };

    const totalDebit = initialData.reduce((sum, item) => sum + Number(item.total_debit), 0);
    const totalCredit = initialData.reduce((sum, item) => sum + Number(item.total_credit), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        تصفية التقرير
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-[300px] flex flex-col gap-2">
                            <label className="text-sm font-medium">تاريخ الميزان</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button onClick={handleFilter}>تطبيق</Button>

                        <div className="flex-1" />

                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" title="طباعة">
                                <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="تصدير Excel">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">رقم الحساب</TableHead>
                                <TableHead>اسم الحساب</TableHead>
                                <TableHead className="text-right">إجمالي مدين</TableHead>
                                <TableHead className="text-right">إجمالي دائن</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        لا توجد بيانات للعرض في هذا التاريخ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                initialData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono">{row.account_code}</TableCell>
                                        <TableCell className="font-medium">{row.account_name}</TableCell>
                                        <TableCell className="text-right">{Number(row.total_debit).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{Number(row.total_credit).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {initialData.length > 0 && (
                            <TableHeader>
                                <TableRow className="bg-muted/50 text-lg">
                                    <TableHead colSpan={2}>الإجمـالـــي</TableHead>
                                    <TableHead className="text-right font-bold text-emerald-700">{totalDebit.toFixed(2)}</TableHead>
                                    <TableHead className="text-right font-bold text-emerald-700">{totalCredit.toFixed(2)}</TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                    </Table>
                </CardContent>
            </Card>

            {!isBalanced && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-between">
                    <span className="font-bold">⚠️ تحذير: الميزان غير متزن!</span>
                    <span>الفرق: {difference.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}
