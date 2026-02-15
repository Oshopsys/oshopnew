"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Folder, Lock, FileText, History, CloudDownload, PenLine, Sigma, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ChartOfAccountsForm from "@/components/forms/chart-of-accounts-form";
import { deleteAccount } from "@/app/actions/accounting";
import { DeleteDialog } from "@/components/delete-dialog";
import { useRouter } from "next/navigation";

interface Account {
    id: string;
    code: string;
    name: string;
    type: string;
    parent_id?: string | null;
    description?: string | null;
    is_group?: boolean;
    is_system?: boolean;
}

interface ChartOfAccountsClientProps {
    accounts: Account[];
}

export default function ChartOfAccountsClient({ accounts }: ChartOfAccountsClientProps) {
    const router = useRouter();
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const accountTypes = [
        { type: "ASSET", label: "الأصول (Assets)" },
        { type: "LIABILITY", label: "الالتزامات (Liabilities)" },
        { type: "EQUITY", label: "حقوق الملكية (Equity)" },
        { type: "REVENUE", label: "الإيرادات (Income)" },
        { type: "EXPENSE", label: "المصروفات (Expenses)" }
    ];

    // Group accounts logic
    const getGroupedAccounts = (type: string) => {
        const typeAccounts = accounts.filter(a => a.type === type);
        // First find root accounts (no parent) and groups
        const rootAccounts = typeAccounts.filter(a => !a.parent_id);

        // This simple grouping might need recursion for deeper levels, 
        // but for now let's stick to 1 level of nesting as per previous UI or simple parent-child
        // effectively, let's just show hierarchy if possible, or just list them.
        // The previous UI had "ungroupped" and "groups". 
        // Let's assume "group" meant "is_group" or having children.
        // For compatibility with the previous UI look:

        // Find accounts that are children of some group in this type
        const groups: { [key: string]: Account[] } = {};
        const ungroupped: Account[] = [];

        // We need to map parent_id to a group name/parent account
        // Let's create a map of id -> account
        const accountMap = new Map(accounts.map(a => [a.id, a]));

        typeAccounts.forEach(acc => {
            if (acc.parent_id && accountMap.has(acc.parent_id)) {
                const parent = accountMap.get(acc.parent_id)!;
                if (!groups[parent.name]) {
                    groups[parent.name] = [];
                }
                groups[parent.name].push(acc);
            } else if (!acc.parent_id) {
                // Root level
                // We'll put root "groups" in ungroupped for now unless they are parents of someone in this list?
                // The previous UI separated "Ungroupped" (individual accounts) vs "Groups" (folders).
                // Let's put all root accounts in "ungroupped" initially, but if they are is_group, they might appear as headers?
                // Actually the previous UI Logic was:
                // if (acc.group) add to groups else ungroupped.
                // Our new schema uses parent_id. 
                // So "ungroupped" = root accounts. "groups" = their children grouped by parent.
                // Wait, if I have a root account "High Level", and it has children.
                // The previous UI showed the children INSIDE the group panel.
                // So "ungroupped" should be root accounts that are NOT groups (or have no children displayed here).

                // Let's simplify: 
                // Render Root Accounts. If a root account is a group, render its children under it.
                // But the previous UI structure was:
                // - Ungroupped Accounts (list)
                // - Group Name (Header) -> List of accounts

                // Let's replicate this:
                // "Ungroupped" = Root accounts (parent_id is null)
                // "Groups" = actually, we can't easily map the previous "string group name" to "parent_id" logic 1:1 visually without fetching parents.
                // But we have all accounts.

                // Let's just put all Root Accounts in "ungroupped" logic for the top list
                // And explicitly render children inside the "Group" section if we want.
                // OR better:
                // Just list all Root Accounts. If an account is a group, afford to expand it?
                // The previous UI was specific. Let's try to adapt:
                // Ungroupped = Accounts with no parent.
                // Groups = We can iterate over Root Accounts that have `is_group`. 
                //    But the previous UI had `groups[acc.group]`. 
                //    If we treat `parent` as `group`.

                if (!acc.parent_id) {
                    ungroupped.push(acc);
                }
            }
        });

        // Now for the "Groups" section of the UI, maybe we want to show children of the "ungroupped" (root) accounts?
        // Let's construct `groups` from `ungroupped` where `is_group` is true.
        const structure: { root: Account, children: Account[] }[] = [];
        const orphans: Account[] = []; // Roots that are not groups? or just all roots?

        ungroupped.forEach(root => {
            const children = typeAccounts.filter(a => a.parent_id === root.id);
            if (children.length > 0) {
                // It behaves like a group in the UI
                // We can render it in the "Groups" section
                // But wait, the previous UI "Ungroupped" section was for accounts without a group.
                // The "Groups" section was for accounts IN a group.
                // So:
                // "Grouped" accounts = specific parent.
                // "Ungroupped" accounts = no parent.
                // This matches!
            }
        });

        return { typeAccounts };
    };

    const handleAdd = (type: string, isGroup: boolean = false, parentId?: string) => {
        setSelectedAccount(null);
        setFormMode("create");
        // Pre-fill type
        setParentId(parentId);
        // We need to pass these to the form somehow, usually via initialData or props.
        // Quick hack: use a temporary initialData with just type
        setSelectedAccount({ type, is_group: isGroup, parent_id: parentId } as any);
        setIsFormOpen(true);
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setFormMode("edit");
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteAccount(deleteId);
            setDeleteId(null);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("فشل حذف الحساب");
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">دليل الحسابات</h1>
                    <p className="text-muted-foreground text-sm">Oshop - ( فرع مصراته )</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" title="إعادة التسمية">
                        <PenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="البريد الإلكتروني">
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="السجل الزمني">
                        <History className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="نسخة احتياطية">
                        <CloudDownload className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {accountTypes.map((section) => {
                    // Filter accounts for this section
                    const sectionAccounts = accounts.filter(a => a.type === section.type);
                    // Root accounts (no parent)
                    const rootAccounts = sectionAccounts.filter(a => !a.parent_id);

                    const isPL = section.type === "Revenue" || section.type === "Expense";

                    return (
                        <Card key={section.type}>
                            <CardHeader className="py-3 bg-muted/20 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">{section.label}</CardTitle>
                                <div className="flex gap-2">
                                    {isPL && (
                                        <Button variant="ghost" size="sm" className="h-8" onClick={() => handleAdd(section.type, true)}>
                                            <Sigma className="mr-2 h-4 w-4" /> مجموع جديد
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handleAdd(section.type, true)}>
                                        <Folder className="mr-2 h-4 w-4" /> مجموعة جديدة
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handleAdd(section.type, false)}>
                                        <Plus className="mr-2 h-4 w-4" /> حساب جديد
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {/* List Root Accounts */}
                                    {rootAccounts.map((root) => {
                                        const children = sectionAccounts.filter(a => a.parent_id === root.id);
                                        const hasChildren = children.length > 0;

                                        return (
                                            <div key={root.id}>
                                                <div className={`flex justify-between items-center p-4 hover:bg-muted/5 pl-8 group ${hasChildren ? 'bg-muted/10 font-semibold' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        {root.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                                                        {root.is_group ? <Folder className="h-4 w-4 text-blue-500" /> : null}
                                                        <span className="text-muted-foreground text-sm font-mono">{root.code}</span>
                                                        <span className="font-medium">{root.name}</span>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {root.is_group && (
                                                            <Button variant="ghost" size="sm" className="h-8" onClick={() => handleAdd(section.type, false, root.id)}>
                                                                <Plus className="h-3 w-3 mr-1" /> إضافة فرعي
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="h-8" onClick={() => handleEdit(root)}>تحرير</Button>
                                                        {!root.is_system && (
                                                            <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => setDeleteId(root.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Render Children */}
                                                {hasChildren && (
                                                    <div className="divide-y border-l-4 border-blue-500/10 ml-8">
                                                        {children.map((child) => (
                                                            <div key={child.id} className="flex justify-between items-center p-3 pl-4 hover:bg-muted/5 group">
                                                                <div className="flex items-center gap-3">
                                                                    {child.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                                                                    <span className="text-muted-foreground text-xs font-mono">{child.code}</span>
                                                                    <span className="font-medium text-sm">{child.name}</span>
                                                                </div>
                                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handleEdit(child)}>تحرير</Button>
                                                                    {!child.is_system && (
                                                                        <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => setDeleteId(child.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {rootAccounts.length === 0 && (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            لا توجد حسابات
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {formMode === "create" ? "إضافة حساب جديد" : "تعديل حساب"}
                        </DialogTitle>
                    </DialogHeader>
                    <ChartOfAccountsForm
                        initialData={selectedAccount}
                        mode={formMode}
                        accountId={selectedAccount?.id}
                        onSuccess={() => setIsFormOpen(false)}
                        parents={accounts.filter(a => a.is_group)} // Allow selecting any group as parent? Simplification. Use logic to avoid circular.
                    />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف الحساب"
                description="هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}
