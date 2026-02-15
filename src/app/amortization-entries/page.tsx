
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAmortizationEntries } from "@/app/actions/assets";
import { format } from "date-fns";

export default async function AmortizationEntriesPage() {
    const entries = await getAmortizationEntries();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">قيود إطفاء الأصول</h1>
                <Button asChild>
                    <Link href="/amortization-entries/new">
                        <Plus className="mr-2 h-4 w-4" /> قيد إطفاء جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل الإطفاء</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الأصل (إن وجد)</TableHead>
                                <TableHead className="text-right">البيان</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries && entries.length > 0 ? (
                                entries.map((entry: any) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(new Date(entry.date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell>{entry.asset?.name || "-"}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                                        <TableCell>{entry.amount.toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <Link href={`/amortization-entries/${entry.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                عرض
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        لا توجد قيود إطفاء مسجلة.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
