
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const TAX_CODES = [
    { id: "1", name: "ضريبة القيمة المضافة 0%", rate: 0 },
    { id: "2", name: "ضريبة القيمة المضافة 15%", rate: 15 },
    { id: "3", name: "ضريبة استقطاع 5%", rate: 5 },
];

export default function TaxCodesPage() {
    return (
        <div className="flex flex-col gap-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">الرموز الضريبية (Tax Codes)</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> رمز ضريبي جديد
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {TAX_CODES.map((tax) => (
                            <div key={tax.id} className="flex justify-between items-center p-4 hover:bg-muted/10">
                                <div className="flex flex-col">
                                    <span className="font-medium">{tax.name}</span>
                                    <span className="text-sm text-muted-foreground">Rate: {tax.rate}%</span>
                                </div>
                                <Button variant="ghost" size="sm">تحرير</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
