
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
import { getProductionOrders } from "@/app/actions/production";
import { format } from "date-fns";

export default async function ProductionOrdersPage() {
    const orders = await getProductionOrders();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">أوامر الإنتاج</h1>
                <Button asChild>
                    <Link href="/production-orders/new">
                        <Plus className="mr-2 h-4 w-4" /> أمر إنتاج جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">سجل أوامر الإنتاج</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">المرجع</TableHead>
                                <TableHead className="text-right">الصنف (المنتج النهائي)</TableHead>
                                <TableHead className="text-right">الكمية</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders && orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{format(new Date(order.date), "yyyy-MM-dd")}</TableCell>
                                        <TableCell className="font-medium">{order.reference}</TableCell>
                                        <TableCell>{order.inventory_item?.name || "-"}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {order.status === 'COMPLETED' ? 'مكتمل' :
                                                    order.status === 'IN_PROGRESS' ? 'قيد التنفيذ' :
                                                        order.status === 'CANCELLED' ? 'ملغي' : 'مسودة'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/production-orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                عرض
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        لا توجد أوامر إنتاج مسجلة.
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
