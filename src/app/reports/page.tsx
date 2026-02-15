
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, PieChart, TrendingUp, DollarSign, Package, Building, Users } from "lucide-react";

const REPORT_GROUPS = [
    {
        title: "دفتر الأستاذ العام (General Ledger)",
        icon: TrendingUp,
        reports: [
            { title: "ميزان المراجعة (Trial Balance)", href: "/reports/trial-balance" },
            { title: "دفتر الأستاذ العام (General Ledger)", href: "/reports/general-ledger" },
        ]
    },
    // {
    //     title: "القوائم المالية (Financial Statements)",
    //     icon: FileText,
    //     reports: [
    //         { title: "قائمة الدخل (Profit and Loss Statement)", href: "#" },
    //         { title: "قائمة المركز المالي (Balance Sheet)", href: "#" },
    //     ]
    // },
];

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-6 pb-20">
            <h1 className="text-3xl font-bold tracking-tight">التقارير</h1>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {REPORT_GROUPS.map((group, idx) => (
                    <Card key={idx} className="h-full">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <group.icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg">{group.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {group.reports.map((report, rIdx) => (
                                    <li key={rIdx}>
                                        <Link
                                            href={report.href}
                                            className="text-sm hover:text-primary hover:underline flex items-center gap-2 py-1"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                                            {report.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
