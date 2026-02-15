import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInvoice } from "@/app/actions/invoices";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ApproveInvoiceButton } from "@/components/approve-invoice-button";
import { UnpostInvoiceButton } from "@/components/unpost-invoice-button";

export default async function PurchaseInvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real invoice data
    const invoice = await getInvoice(id);

    if (!invoice) {
        notFound();
    }

    const lines = invoice.lines || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">تفاصيل فاتورة الشراء</h1>
                <div className="flex gap-2">
                    <ApproveInvoiceButton invoiceId={id} currentStatus={invoice.status || 'DRAFT'} />
                    <UnpostInvoiceButton invoiceId={id} currentStatus={invoice.status || 'DRAFT'} />
                    <Button variant="outline" asChild>
                        <Link href="/purchase-invoices">
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/purchase-invoices/${id}/edit`}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    {/* Use notes for reference since we stored it there */}
                    <CardTitle>فاتورة رقم: {invoice.invoice_number}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-semibold text-muted-foreground">التاريخ:</span>
                            <p className="mt-1">{new Date(invoice.date).toLocaleDateString("ar-LY")}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">الحالة:</span>
                            <div className="mt-1">
                                <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "POSTED" ? "secondary" : "outline"}>
                                    {invoice.status === 'POSTED' ? 'مرحّل' : invoice.status === 'DRAFT' ? 'مسودة' : invoice.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="font-semibold text-muted-foreground">المورد:</span>
                        <p className="mt-1">{invoice.partner?.name || "—"}</p>
                    </div>

                    <div>
                        <span className="font-semibold text-muted-foreground">التفاصيل / الملاحظات:</span>
                        <p className="mt-1 whitespace-pre-wrap">{invoice.notes || "—"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>بنود الفاتورة</CardTitle>
                </CardHeader>
                <CardContent>
                    {lines.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">#</TableHead>
                                    <TableHead className="text-right">البند</TableHead>
                                    <TableHead className="text-right">الوصف</TableHead>
                                    <TableHead className="text-right">الكمية</TableHead>
                                    <TableHead className="text-right">سعر الوحدة</TableHead>
                                    <TableHead className="text-right">الخصم</TableHead>
                                    <TableHead className="text-right">الإجمالي</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line: any, index: number) => {
                                    const total = (line.quantity * line.unit_price) - (line.discount || 0);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{line.item?.name || "—"}</TableCell>
                                            <TableCell>{line.description}</TableCell>
                                            <TableCell>{line.quantity}</TableCell>
                                            <TableCell>{line.unit_price.toFixed(2)}</TableCell>
                                            <TableCell>{(line.discount || 0).toFixed(2)}</TableCell>
                                            <TableCell className="font-bold">{total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد بنود</p>
                    )}

                    <div className="mt-4 flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي المستحق:</span>
                                <span>{invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ل</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
