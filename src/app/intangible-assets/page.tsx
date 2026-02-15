
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
import { INTANGIBLE_ASSETS } from "@/lib/mock-data";

export default function IntangibleAssetsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">الأصول غير الملموسة</h1>
                <Button asChild>
                    <Link href="/intangible-assets/new">
                        <Plus className="mr-2 h-4 w-4" /> أصل جديد
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
                                <TableHead className="text-right">إطفاء متراكم</TableHead>
                                <TableHead className="text-right">القيمة الدفترية</TableHead>
                                <TableHead className="text-right">معدل الإطفاء</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {INTANGIBLE_ASSETS.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium">{asset.code}</TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.acquisitionCost.toLocaleString()} د.ل</TableCell>
                                    <TableCell>{asset.amortization.toLocaleString()} د.ل</TableCell>
                                    <TableCell className="font-bold">{asset.bookValue.toLocaleString()} د.ل</TableCell>
                                    <TableCell>{asset.rate}</TableCell>
                                    <TableCell>
                                        <Link href={`/intangible-assets/${asset.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                            تعديل
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
