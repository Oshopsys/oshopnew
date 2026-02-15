import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MENU_ITEMS } from "@/lib/mock-data";
import Image from "next/image";
import { getSidebarCounts } from "@/app/actions/sidebar-actions";

export async function Sidebar() {
    const counts = await getSidebarCounts();

    // Merge counts with menu items
    const menuItemsWithCounts = MENU_ITEMS.map((item) => ({
        ...item,
        count: item.count !== null ? item.count : (counts[item.href as keyof typeof counts] ?? null),
    }));

    return (
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-[280px] min-h-screen flex-col">
            <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
                <Link className="flex items-center gap-2 font-semibold" href="/">
                    <Image src="/images/logo.png" alt="Oshop Logo" width={32} height={32} className="h-8 w-8" />
                    <span className="">Oshop - النظام الجديد</span>
                </Link>
            </div>
            <ScrollArea className="flex-1">
                <nav className="grid items-start px-4 text-sm font-medium lg:px-4 py-4">
                    {menuItemsWithCounts.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                "text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {item.count !== null && (
                                <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold dark:bg-gray-800">
                                    {item.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
}
