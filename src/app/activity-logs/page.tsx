'use client';

import { useEffect, useState } from 'react';
import { ActivityLog, getActivityLogs, ActivityLogFilters } from '@/app/actions/activity-logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const entityTypeLabels: Record<string, string> = {
    inventory_item: 'صنف',
    bank_account: 'حساب بنكي',
    employee: 'موظف',
    partner: 'شريك',
};

const actionIcons = {
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
};

const actionColors = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const actionLabels = {
    CREATE: 'إنشاء',
    UPDATE: 'تعديل',
    DELETE: 'حذف',
};

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async (filters?: ActivityLogFilters) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getActivityLogs(filters);
            setLogs(data);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ في تحميل السجلات');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">جاري التحميل...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                    <CardContent className="p-6">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                سجلات النشاط
                            </CardTitle>
                            <CardDescription>
                                تتبع جميع التغييرات على الأصناف، الحسابات، الموظفين، والشركاء
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">{logs.length} سجل</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">العملية</TableHead>
                                <TableHead className="text-right">النوع</TableHead>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        لا توجد سجلات مسجلة حتى الآن
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => {
                                    const Icon = actionIcons[log.action];
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge className={actionColors[log.action]}>
                                                    <Icon className="ml-1 h-3 w-3" />
                                                    {actionLabels[log.action]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{entityTypeLabels[log.entity_type] || log.entity_type}</TableCell>
                                            <TableCell className="font-medium">{log.entity_name || '-'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.created_at), {
                                                    addSuffix: true,
                                                    locale: ar
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
