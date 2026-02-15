
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
import { getBankAccounts } from "@/app/actions/treasury";

export default async function BankAccountsPage() {
    const accounts = await getBankAccounts();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">حسابات البنك والنقدية</h1>
                <Button asChild>
                    <Link href="/bank-accounts/new">
                        <Plus className="mr-2 h-4 w-4" /> حساب جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">قائمة الحسابات ({accounts?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!accounts || accounts.length === 0) ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا توجد حسابات بنكية أو نقدية مسجلة.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الرمز</TableHead>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">رقم الحساب</TableHead>
                                    <TableHead className="text-right">العملة</TableHead>
                                    <TableHead className="text-right">الرصيد الحالي</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium">{account.code || '-'}</TableCell>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell>{account.account_number || '-'}</TableCell>
                                        <TableCell>{account.currency || 'LYD'}</TableCell>
                                        <TableCell className="font-bold">0.00 {account.currency || 'LYD'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/bank-accounts/${account.id}`}>
                                                    تعديل
                                                </Link>
                                            </Button>
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
