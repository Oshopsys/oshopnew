
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
import { getInventoryItems } from "@/app/actions/inventory";

export const dynamic = 'force-dynamic';

export default async function InventoryItemsPage() {
    const items = await getInventoryItems();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">أصناف المخزون</h1>
                <Button asChild>
                    <Link href="/inventory-items/new">
                        <Plus className="mr-2 h-4 w-4" /> صنف جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">قائمة الأصناف ({items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!items || items.length === 0) ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا توجد أصناف مخزون مسجلة حالياً.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الرمز</TableHead>
                                    <TableHead className="text-right">اسم الصنف</TableHead>
                                    <TableHead className="text-right">الوصف</TableHead>
                                    <TableHead className="text-right">سعر البيع</TableHead>
                                    <TableHead className="text-right">الكمية المتوفرة</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.code}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.description || '-'}</TableCell>
                                        <TableCell>{(item.sales_price || 0).toLocaleString()} د.ل</TableCell>
                                        <TableCell>{item.quantity_on_hand || 0}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/inventory-items/${item.id}`}>
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
