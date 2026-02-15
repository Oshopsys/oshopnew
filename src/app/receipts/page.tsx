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
import { getReceipts, deleteReceipt } from "@/app/actions/treasury";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import { format } from "date-fns";

export default async function ReceiptsPage() {
    const receipts = await getReceipts();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">المقبوضات</h1>
                <Button asChild>
                    <Link href="/receipts/new">
                        <Plus className="mr-2 h-4 w-4" /> سند قبض جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل المقبوضات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">المرجع</TableHead>
                                <TableHead className="text-right">حساب القبض</TableHead>
                                <TableHead className="text-right">البيان</TableHead>
                                <TableHead className="text-right">جهة الدفع</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipts && receipts.length > 0 ? (
                                receipts.map((receipt: any) => (
                                    <TableRow key={receipt.id}>
                                        <TableCell>{format(new Date(receipt.date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell className="font-medium">{receipt.reference || receipt.number}</TableCell>
                                        <TableCell>{receipt.bank_account?.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{receipt.description}</TableCell>
                                        <TableCell>{receipt.partner?.name || "-"}</TableCell>
                                        <TableCell>{receipt.amount.toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/receipts/${receipt.id}`}>
                                                        عرض
                                                    </Link>
                                                </Button>
                                                <DeleteDocumentButton
                                                    documentId={receipt.id}
                                                    documentType="receipt"
                                                    deleteAction={deleteReceipt}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        لا توجد مقبوضات مسجلة.
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
