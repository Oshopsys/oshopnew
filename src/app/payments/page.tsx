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
import { getPayments, deletePayment } from "@/app/actions/treasury";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import { format } from "date-fns";

export default async function PaymentsPage() {
    const payments = await getPayments();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">المدفوعات</h1>
                <Button asChild>
                    <Link href="/payments/new">
                        <Plus className="mr-2 h-4 w-4" /> سند صرف جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل المدفوعات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الرقم</TableHead>
                                <TableHead className="text-right">مدفوع من</TableHead>
                                <TableHead className="text-right">البيان</TableHead>
                                <TableHead className="text-right">المستفيد</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments && payments.length > 0 ? (
                                payments.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell className="font-medium">{payment.number}</TableCell>
                                        <TableCell>{payment.bank_account?.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{payment.description}</TableCell>
                                        <TableCell>{payment.partner?.name || "-"}</TableCell>
                                        <TableCell>{payment.amount.toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/payments/${payment.id}`}>
                                                        عرض
                                                    </Link>
                                                </Button>
                                                <DeleteDocumentButton
                                                    documentId={payment.id}
                                                    documentType="payment"
                                                    deleteAction={deletePayment}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        لا توجد مدفوعات مسجلة.
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
