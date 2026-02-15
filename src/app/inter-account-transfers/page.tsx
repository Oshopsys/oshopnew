
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
import { getTransfers } from "@/app/actions/treasury";
import { format } from "date-fns";

export default async function TransfersPage() {
    const transfers = await getTransfers();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">تحويلات بين الحسابات</h1>
                <Button asChild>
                    <Link href="/inter-account-transfers/new">
                        <Plus className="mr-2 h-4 w-4" /> تحويل جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل التحويلات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">المرجع</TableHead>
                                <TableHead className="text-right">مدفوع من</TableHead>
                                <TableHead className="text-right">حساب القبض</TableHead>
                                <TableHead className="text-right">البيان</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transfers && transfers.length > 0 ? (
                                transfers.map((transfer: any) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>{format(new Date(transfer.date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell className="font-medium">{transfer.reference || transfer.number}</TableCell>
                                        <TableCell>{transfer.bank_account?.name}</TableCell>
                                        <TableCell>-</TableCell> {/* 'To' account not easily available in list without complex joint */}
                                        <TableCell className="max-w-[200px] truncate">{transfer.description}</TableCell>
                                        <TableCell>{transfer.amount.toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <Link href={`/inter-account-transfers/${transfer.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                عرض
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        لا توجد تحويلات مسجلة.
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
