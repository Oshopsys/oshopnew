
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
import { PAYSLIPS } from "@/lib/mock-data";

export default function PayslipsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">قسائم الرواتب</h1>
                <Button asChild>
                    <Link href="/payslips/new">
                        <Plus className="mr-2 h-4 w-4" /> قسيمة راتب جديدة
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل الرواتب</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الموظف</TableHead>
                                <TableHead className="text-right">إجمالي الاستحقاق</TableHead>
                                <TableHead className="text-right">الاستقطاعات</TableHead>
                                <TableHead className="text-right">صافي الراتب</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PAYSLIPS.map((payslip) => (
                                <TableRow key={payslip.id}>
                                    <TableCell>{payslip.date}</TableCell>
                                    <TableCell className="font-medium">{payslip.employee}</TableCell>
                                    <TableCell>{payslip.earnings.toLocaleString()} د.ل</TableCell>
                                    <TableCell className="text-red-500">{payslip.deductions.toLocaleString()} د.ل</TableCell>
                                    <TableCell className="font-bold">{payslip.netPay.toLocaleString()} د.ل</TableCell>
                                    <TableCell>
                                        <Link href={`/payslips/${payslip.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                            عرض
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
