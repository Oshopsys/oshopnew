
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
import { Badge } from "@/components/ui/badge";
import { getInvoices, deleteInvoice } from "@/app/actions/invoices";
import { ApproveInvoiceInlineButton } from "@/components/approve-invoice-inline-button";
import { DeleteDocumentButton } from "@/components/delete-document-button";

export default async function PurchaseInvoicesPage() {
    const invoices = await getInvoices('PURCHASE');

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">فواتير الشراء</h1>
                <Button asChild>
                    <Link href="/purchase-invoices/new">
                        <Plus className="mr-2 h-4 w-4" /> فاتورة شراء جديدة
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">قائمة فواتير الشراء ({invoices?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!invoices || invoices.length === 0) ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا توجد فواتير شراء مسجلة.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">التاريخ</TableHead>
                                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                                    <TableHead className="text-right">المورد</TableHead>
                                    <TableHead className="text-right">الإجمالي</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{new Date(invoice.date).toLocaleDateString('en-GB')}</TableCell>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.partner?.name || '-'}</TableCell>
                                        <TableCell>{(invoice.total || 0).toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "POSTED" ? "secondary" : "outline"}>
                                                {invoice.status === 'POSTED' ? 'مرحّل' : invoice.status === 'DRAFT' ? 'مسودة' : invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/purchase-invoices/${invoice.id}`}>
                                                        عرض
                                                    </Link>
                                                </Button>
                                                <ApproveInvoiceInlineButton
                                                    invoiceId={invoice.id}
                                                    currentStatus={invoice.status}
                                                />
                                                <DeleteDocumentButton
                                                    documentId={invoice.id}
                                                    documentType="invoice"
                                                    deleteAction={deleteInvoice}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
