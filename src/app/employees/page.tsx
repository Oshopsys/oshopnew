
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
import { getEmployees } from "@/app/actions/hr";

export default async function EmployeesPage() {
    const employees = await getEmployees();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">الموظفون</h1>
                <Button asChild>
                    <Link href="/employees/new">
                        <Plus className="mr-2 h-4 w-4" /> موظف جديد
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">قائمة الموظفين ({employees?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!employees || employees.length === 0) ? (
                        <div className="text-center py-10 text-muted-foreground">
                            لا يوجد موظفون مسجلين حالياً.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الرمز</TableHead>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">المسمى الوظيفي</TableHead>
                                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.code || '-'}</TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell>{employee.position || '-'}</TableCell>
                                        <TableCell>{employee.email || '-'}</TableCell>
                                        <TableCell>{employee.status || 'Active'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/employees/${employee.id}`}>
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
