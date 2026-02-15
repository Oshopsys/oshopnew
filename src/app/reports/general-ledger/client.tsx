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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LedgerEntry {
    transaction_date: string;
    entry_number: string;
    description: string;
    account_name: string;
    debit: number;
    credit: number;
    balance: number;
}

interface GeneralLedgerClientProps {
    initialData: LedgerEntry[];
    accounts: any[];
    defaultStartDate: string;
    defaultEndDate: string;
    defaultAccountId?: string;
}

export default function GeneralLedgerClient({
    initialData,
    accounts,
    defaultStartDate,
    defaultEndDate,
    defaultAccountId
}: GeneralLedgerClientProps) {
    const router = useRouter();
    const [date, setDate] = useState<{ from: Date, to: Date } | undefined>({
        from: new Date(defaultStartDate),
        to: new Date(defaultEndDate)
    });
    const [accountId, setAccountId] = useState<string>(defaultAccountId || "all");

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (date?.from) params.set("startDate", format(date.from, "yyyy-MM-dd"));
        if (date?.to) params.set("endDate", format(date.to, "yyyy-MM-dd"));
        if (accountId && accountId !== "all") params.set("accountId", accountId);

        router.push(`/reports/general-ledger?${params.toString()}`);
    };

    const totalDebit = initialData.reduce((sum, item) => sum + Number(item.debit), 0);
    const totalCredit = initialData.reduce((sum, item) => sum + Number(item.credit), 0);
    // Balance depends on account type normally, but here let's just show net movement
    const netMovement = totalDebit - totalCredit;

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
                            <label className="text-sm font-medium">الفترة الزمنية</label>
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
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date as any} // DateRange type mismatch hack, shadcn uses specific type
                                        onSelect={(range: any) => setDate(range)}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="w-full md:w-[300px] flex flex-col gap-2">
                            <label className="text-sm font-medium">الحساب</label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="كل الحسابات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الحسابات</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.code ? `${acc.code} - ` : ''}{acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                <TableHead>التاريخ</TableHead>
                                <TableHead>رقم القيد</TableHead>
                                <TableHead>الوصف</TableHead>
                                <TableHead>الحساب</TableHead>
                                <TableHead className="text-right">مدين</TableHead>
                                <TableHead className="text-right">دائن</TableHead>
                                <TableHead className="text-right">الرصيد</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        لا توجد بيانات للعرض في هذه الفترة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                initialData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{format(new Date(row.transaction_date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell className="font-mono text-xs">{row.entry_number}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.account_name}</TableCell>
                                        <TableCell className="text-right">{Number(row.debit).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{Number(row.credit).toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-medium">{Number(row.balance).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {initialData.length > 0 && (
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead colSpan={4}>الإجمـالـــي</TableHead>
                                    <TableHead className="text-right text-emerald-600 font-bold">{totalDebit.toFixed(2)}</TableHead>
                                    <TableHead className="text-right text-red-600 font-bold">{totalCredit.toFixed(2)}</TableHead>
                                    <TableHead className="text-right font-bold" dir="ltr">{netMovement.toFixed(2)}</TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
