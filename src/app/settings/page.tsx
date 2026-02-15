
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Settings, FileText, Database, Users, Globe, Lock, Mail, Palette, Building } from "lucide-react";

const SETTINGS_GROUPS = [
    {
        title: "بيانات العمل (Business Details)",
        icon: Building,
        items: [
            { title: "تفاصيل العمل التجاري", href: "/settings/business-details", desc: "الاسم، العنوان، الشعار، ومعلومات الاتصال" },
            { title: "دليل الحسابات (Chart of Accounts)", href: "/settings/chart-of-accounts", desc: "إعداد وتخصيص شجرة الحسابات المالية" },
            { title: "العملات (Currencies)", href: "/settings/currencies", desc: "العملة الأساسية وأسعار الصرف" },
        ]
    },
    {
        title: "الضرائب والرسوم (Tax & Charges)",
        icon: FileText,
        items: [
            { title: "الرموز الضريبية (Tax Codes)", href: "/settings/tax-codes", desc: "إعدادات ضريبة القيمة المضافة والضرائب الأخرى" },
        ]
    },
    {
        title: "إعدادات التشغيل (Operational)",
        icon: Database,
        items: [
            { title: "أصناف غير مخزنية", href: "/settings/non-inventory-items", desc: "الخدمات والمنتجات غير الملموسة" },
            { title: "الأرصدة الافتتاحية", href: "/settings/starting-balances", desc: "إدخال أرصدة بداية المدة للحسابات" },
            { title: "الحقول المخصصة", href: "/settings/custom-fields", desc: "إضافة حقول إضافية للنماذج" },
        ]
    },
    {
        title: "النظام والأمان (System)",
        icon: Lock,
        items: [
            { title: "المستخدمين والصلاحيات", href: "/settings/users", desc: "إدارة المستخدمين ومستويات الوصول" },
            { title: "إعدادات البريد الإلكتروني", href: "/settings/email", desc: "قوالب البريد وإعدادات SMTP" },
            { title: "الواجهات (Themes)", href: "/settings/themes", desc: "تخصيص مظهر الفواتير والمستندات" },
        ]
    }
];

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 pb-20">
            <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {SETTINGS_GROUPS.map((group, idx) => (
                    <Card key={idx}>
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-background rounded-lg border shadow-sm">
                                    <group.icon className="h-5 w-5 text-foreground" />
                                </div>
                                <CardTitle className="text-lg">{group.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 grid gap-4">
                            {group.items.map((item, iIdx) => (
                                <Link
                                    key={iIdx}
                                    href={item.href}
                                    className="flex flex-col gap-1 p-3 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                >
                                    <span className="font-medium text-primary">{item.title}</span>
                                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
