
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getJournalEntries, deleteJournalEntry } from "./actions";
import { DeleteDocumentButton } from "@/components/delete-document-button";

export default async function JournalEntriesPage() {
    const entries = await getJournalEntries();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">القيود المحاسبية</h1>
                <Button asChild>
                    <Link href="/journal-entries/new">
                        <Plus className="mr-2 h-4 w-4" /> قيد جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل القيود ({entries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا توجد قيود محاسبية مسجلة.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">التاريخ</TableHead>
                                    <TableHead className="text-right">رقم القيد</TableHead>
                                    <TableHead className="text-right">الشرح</TableHead>
                                    <TableHead className="text-right">إجمالي المدين</TableHead>
                                    <TableHead className="text-right">إجمالي الدائن</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry) => {
                                    // Calculate totals from lines
                                    const totalDebit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
                                    const totalCredit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
                                    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

                                    // Map status to Arabic and variant
                                    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
                                        'POSTED': { label: 'مرحّل', variant: 'default' },
                                        'DRAFT': { label: 'مسودة', variant: 'secondary' },
                                        'ARCHIVED': { label: 'مؤرشف', variant: 'outline' }
                                    };
                                    const statusInfo = statusMap[entry.status] || { label: entry.status, variant: 'outline' };

                                    return (
                                        <TableRow key={entry.id}>
                                            <TableCell>{new Date(entry.transaction_date).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell className="font-medium">{entry.reference || '-'}</TableCell>
                                            <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                                            <TableCell className="font-mono">{totalDebit.toLocaleString()} د.ل</TableCell>
                                            <TableCell className="font-mono">{totalCredit.toLocaleString()} د.ل</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Badge variant={statusInfo.variant}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                    {!isBalanced && (
                                                        <Badge variant="destructive">غير متزن!</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/journal-entries/${entry.id}/edit`}>
                                                            تعديل
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/journal-entries/${entry.id}`}>
                                                            عرض
                                                        </Link>
                                                    </Button>
                                                    <DeleteDocumentButton
                                                        documentId={entry.id}
                                                        documentType="journal-entry"
                                                        deleteAction={deleteJournalEntry}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
