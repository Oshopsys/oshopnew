
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
import { getCapitalAccounts } from "@/app/actions/capital";

export default async function CapitalAccountsPage() {
    const accounts = await getCapitalAccounts();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">حسابات رأس المال</h1>
                <Button asChild>
                    <Link href="/capital-accounts/new">
                        <Plus className="mr-2 h-4 w-4" /> حساب جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">الشركاء / الملاك</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الرمز</TableHead>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts && accounts.length > 0 ? (
                                accounts.map((account: any) => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium">{account.code}</TableCell>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell>{account.initial_balance?.toLocaleString()} د.ل</TableCell>
                                        <TableCell>
                                            <Link href={`/capital-accounts/${account.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                تعديل
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        لا توجد حسابات رأس مال مسجلة.
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
