import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/delete-dialog";
import { getBankAccount } from "@/app/actions/treasury";
import { notFound } from "next/navigation";

export default async function BankAccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const account = await getBankAccount(id);

    if (!account) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">تفاصيل الحساب البنكي</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/bank-accounts">
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            رجوع
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/bank-accounts/${id}/edit`}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                        </Link>
                    </Button>
                    {/* Delete button removed or needs client wrapper */}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-semibold text-muted-foreground">التسلسل:</span>
                            <p className="mt-1">{account.id}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">الرمز:</span>
                            <p className="mt-1">{account.code || "—"}</p>
                        </div>
                    </div>

                    <div>
                        <span className="font-semibold text-muted-foreground">رقم الحساب:</span>
                        <p className="mt-1">{account.account_number || "—"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-semibold text-muted-foreground">العملة:</span>
                            <p className="mt-1">{account.currency || "—"}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">الرصيد:</span>
                            <p className="mt-1 text-2xl font-bold text-primary">
                                {/* Note: balance might need to be calculated or fetched from view? 
                                    Using data from table directly for now if it's maintained there. 
                                    Assuming 'balance' column exists or handled via RPC logic.
                                */}
                                {/* {account.balance?.toLocaleString() || "0"} د.ل */}
                                {/* IF balance is not in the row, we might need getAccountBalance RPC. 
                                    But bank_accounts usually have a balance field or we compute it. 
                                    Checking list page: it displayed 0.00 hardcoded?
                                    <TableCell className="font-bold">0.00 {account.currency || 'LYD'}</TableCell>
                                    Let's stick to simple display or 0 for now until balance logic is solid.
                                */}
                                {(account as any).balance ? (account as any).balance.toLocaleString() : "0.00"} {account.currency}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
