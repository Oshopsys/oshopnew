
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
import { getFixedAssets } from "@/app/actions/assets";

export default async function FixedAssetsPage() {
    const assets = await getFixedAssets();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">الأصول الثابتة</h1>
                <Button asChild>
                    <Link href="/fixed-assets/new">
                        <Plus className="mr-2 h-4 w-4" /> أصل ثابت جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">قائمة الأصول</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الرمز</TableHead>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">تكلفة الاقتناء</TableHead>
                                <TableHead className="text-right">الإهلاك المتراكم</TableHead>
                                <TableHead className="text-right">القيمة الدفترية</TableHead>
                                <TableHead className="text-right">معدل الإهلاك</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets && assets.length > 0 ? (
                                assets.map((asset: any) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.code}</TableCell>
                                        <TableCell>{asset.name}</TableCell>
                                        <TableCell>{asset.purchase_cost.toLocaleString()} د.ل</TableCell>
                                        <TableCell>{asset.accumulated_depreciation.toLocaleString()} د.ل</TableCell>
                                        <TableCell className="font-bold">{asset.book_value.toLocaleString()} د.ل</TableCell>
                                        <TableCell>{asset.depreciation_rate}%</TableCell>
                                        <TableCell>{asset.status}</TableCell>
                                        <TableCell>
                                            <Link href={`/fixed-assets/${asset.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                تعديل
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        لا توجد أصول مسجلة.
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
