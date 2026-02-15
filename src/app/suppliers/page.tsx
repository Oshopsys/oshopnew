
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
import { getSuppliers } from "@/app/actions/partners";

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">الموردون</h1>
                <Button asChild>
                    <Link href="/suppliers/new">
                        <Plus className="mr-2 h-4 w-4" /> مورد جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">دليل الموردين ({suppliers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {suppliers.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا يوجد موردون مسجلين حالياً.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">التسلسل</TableHead>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">الرمز</TableHead>
                                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.map((supplier, index) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{supplier.name}</TableCell>
                                        <TableCell>{supplier.code || '-'}</TableCell>
                                        <TableCell>{supplier.email || '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/suppliers/${supplier.id}`}>
                                                    عرض
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
