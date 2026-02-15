import {
    LayoutDashboard,
    Wallet,
    Receipt,
    CreditCard,
    ArrowRightLeft,
    Users,
    FileText,
    Truck,
    ShoppingCart,
    Package,
    Factory,
    UserCog,
    FileSpreadsheet,
    Building,
    Scale,
    Combine,
    Briefcase,
    BookOpen,
    Settings,
    BarChart3,
    History
} from "lucide-react";

export const MENU_ITEMS = [
    { label: "الملخص", href: "/", icon: LayoutDashboard, count: null },
    { label: "حسابات البنك والنقدية", href: "/bank-accounts", icon: Wallet, count: null },
    { label: "المقبوضات", href: "/receipts", icon: Receipt, count: null },
    { label: "المدفوعات", href: "/payments", icon: CreditCard, count: null },
    { label: "تحويلات بين الحسابات", href: "/inter-account-transfers", icon: ArrowRightLeft, count: null },
    { label: "العملاء", href: "/customers", icon: Users, count: null },
    { label: "فواتير البيع", href: "/sales-invoices", icon: FileText, count: null },
    { label: "الموردون", href: "/suppliers", icon: Truck, count: null },
    { label: "فواتير الشراء", href: "/purchase-invoices", icon: ShoppingCart, count: null },
    { label: "أصناف المخزون", href: "/inventory-items", icon: Package, count: null },
    { label: "أوامر الإنتاج", href: "/production-orders", icon: Factory, count: null },
    { label: "الموظفون", href: "/employees", icon: UserCog, count: null },
    { label: "قسائم الرواتب", href: "/payslips", icon: FileSpreadsheet, count: null },
    { label: "الأصول الثابتة", href: "/fixed-assets", icon: Building, count: null },
    { label: "قيود إهلاك الأصول", href: "/depreciation-entries", icon: Scale, count: null },
    { label: "الأصول غير الملموسة", href: "/intangible-assets", icon: Combine, count: null },
    { label: "قيود إطفاء الأصول", href: "/amortization-entries", icon: Scale, count: null },
    { label: "حسابات رأس المال", href: "/capital-accounts", icon: Briefcase, count: null },
    { label: "القيود المحاسبية", href: "/journal-entries", icon: BookOpen, count: null },
    { label: "سجلات النشاط", href: "/activity-logs", icon: History, count: null },
    { label: "التقارير", href: "/reports", icon: BarChart3, count: null },
    { label: "الإعدادات", href: "/settings", icon: Settings, count: null },
];

export const SUMMARY_DATA = {
    assets: [
        { name: "الأصول الثابتة بالتكلفة", balance: 13000.00 },
        { name: "الأصول المتداولة", balance: 524050.00 },
        { name: "مخزون في اليد", balance: 3200.00 },
        { name: "نقد في الصندوق", balance: 14500.00 },
    ],
    liabilities: [
        { name: "مستحقات الموظفين", balance: 4500.00 },
        { name: "ضريبة القيمة المضافة", balance: 1200.00 },
    ],
    equity: [
        { name: "الأرباح المبقاة", balance: 343050.00 }, // تم إصلاحها = Total Assets - Total Liabilities - Capital - Net Profit
        { name: "رأس المال", balance: 100000.00 },
        { name: "صافي ربح العام", balance: 77000.00 }, // ✅ إضافة صافي الربح كجزء من حقوق الملكية
    ],
    income: {
        revenue: 154000.00,
        costOfRevenue: 45000.00,
        expenses: 32000.00,
        netProfit: 77000.00
    }
};

export const CUSTOMERS = [
    { id: "1", name: "شركة الأفق للتقنية", email: "info@aloofoq.ly" },
    { id: "2", name: "محلات الرواد", email: "sales@alruwad.ly" },
    { id: "3", name: "مؤسسة البناء الحديث", email: "contact@binaa.ly" },
];

export const INVENTORY_ITEMS = [
    { id: "1", code: "ITEM-001", name: "خدمة شحن - طرابلس", price: 150.00 },
    { id: "2", code: "ITEM-002", name: "خدمة شحن - بنغازي", price: 200.00 },
    { id: "3", code: "ITEM-003", name: "تغليف خاص", price: 50.00 },
];

export const INVOICES = [
    { id: "INV-001", date: "2024-02-01", customer: "شركة الأفق للتقنية", amount: 1500.00, status: "مدفوعة" },
    { id: "INV-002", date: "2024-02-05", customer: "محلات الرواد", amount: 3200.00, status: "مستحقة" },
    { id: "INV-003", date: "2024-02-10", customer: "مؤسسة البناء الحديث", amount: 850.00, status: "متأخرة" },
];

export const SUPPLIERS = [
    { id: "1", name: "المورد الأول - الصين", email: "supplier1@china.com" },
    { id: "2", name: "شركة النقل السريع", email: "trans@logistic.ly" },
];

export const PURCHASE_INVOICES = [
    { id: "PINV-001", date: "2024-01-15", supplier: "المورد الأول - الصين", amount: 15000.00, status: "مدفوعة" },
    { id: "PINV-002", date: "2024-02-02", supplier: "شركة النقل السريع", amount: 1200.00, status: "مستحقة" },
];

export const ACCOUNTS = [
    // Assets - Fixed Assets
    { id: "1000", code: "1100", name: "الأصول الثابتة - بالتكلفة", type: "Asset", systemAccount: true, parentId: null, level: 1 },
    { id: "1001", code: "1101", name: "الأصول الثابتة - مجمع الإهلاك", type: "Asset", systemAccount: true, parentId: null, level: 1 },

    // Assets - Current Assets
    { id: "1100", code: "1200", name: "المخزون الحالي", type: "Asset", systemAccount: true, parentId: null, level: 1 },
    { id: "1101", code: "1201", name: "تصفية المخزون السالب", type: "Asset", systemAccount: true, parentId: null, level: 1 },
    { id: "1200", code: "1300", name: "مدينون تجاريون", type: "Asset", systemAccount: true, parentId: null, level: 1 },
    { id: "1201", code: "1400", name: "النقد وما في حكمه", type: "Asset", systemAccount: true, parentId: null, level: 1 },

    // Current Assets - E-Wallets
    { id: "1301", code: "1410", name: "محفظة سداد", type: "Asset", group: "أرصدة محافظ الكترونية", parentId: null, level: 2 },
    { id: "1302", code: "1411", name: "محفظة تداول", type: "Asset", group: "أرصدة محافظ الكترونية", parentId: null, level: 2 },
    { id: "1303", code: "1412", name: "القيمة النقدية بالمحافظ", type: "Asset", group: "أرصدة محافظ الكترونية", parentId: null, level: 2 },

    // Current Assets - Related Parties
    { id: "1401", code: "1500", name: "المستحق من اوشوب طرابلس", type: "Asset", group: "المستحق من أطراف ذوي علاقة", parentId: null, level: 2 },

    // Liabilities
    { id: "2000", code: "2100", name: "أمانات زبائن", type: "Liability", systemAccount: true, parentId: null, level: 1 },
    { id: "2001", code: "2200", name: "دائنون تجاريون", type: "Liability", systemAccount: true, parentId: null, level: 1 },
    { id: "2100", code: "2300", name: "ضريبة القيمة المضافة", type: "Liability", systemAccount: true, parentId: null, level: 1 },

    // Equity
    { id: "3000", code: "3100", name: "أرباح مبقاة", type: "Equity", systemAccount: true, parentId: null, level: 1 },
    { id: "3001", code: "3200", name: "رأس المال", type: "Equity", systemAccount: true, parentId: null, level: 1 },

    // Revenue - Inventory Sales
    { id: "4000", code: "4100", name: "المخزون - مبيعات", type: "Revenue", systemAccount: true, parentId: null, level: 1 },

    // Revenue - Shein Services
    { id: "4101", code: "4200", name: "خدمات شي ان", type: "Revenue", group: "خدمات شي ان", parentId: null, level: 2 },
    { id: "4102", code: "4201", name: "شحن مجاني", type: "Revenue", group: "خدمات شي ان", parentId: null, level: 2 },
    { id: "4103", code: "4202", name: "خدمات وساطة شراء", type: "Revenue", group: "خدمات شي ان", parentId: null, level: 2 },

    // Revenue - Shipping Services
    { id: "4201", code: "4300", name: "شحن جوي - أمريكا", type: "Revenue", group: "خدمات الشحن", parentId: null, level: 2 },
    { id: "4202", code: "4301", name: "شحن جوي - الصين", type: "Revenue", group: "خدمات الشحن", parentId: null, level: 2 },
    { id: "4203", code: "4302", name: "شحن جوي - الامارات", type: "Revenue", group: "خدمات الشحن", parentId: null, level: 2 },

    // Expenses - COGS
    { id: "5000", code: "5100", name: "المخزون - تكلفة البضاعة المباعة", type: "Expense", systemAccount: true, parentId: null, level: 1 },

    // Expenses - General & Administrative
    { id: "5101", code: "5200", name: "إيجار", type: "Expense", group: "مصروفات عامة وإدارية", parentId: null, level: 2 },
    { id: "5102", code: "5201", name: "رواتب وأجور", type: "Expense", group: "مصروفات عامة وإدارية", parentId: null, level: 2 },
    { id: "5103", code: "5202", name: "كهرباء", type: "Expense", group: "مصروفات عامة وإدارية", parentId: null, level: 2 },
    { id: "5104", code: "5203", name: "قرطاسية", type: "Expense", group: "مصروفات عامة وإدارية", parentId: null, level: 2 },
    { id: "5105", code: "5204", name: "عجز نقدية", type: "Expense", group: "مصروفات عامة وإدارية", parentId: null, level: 2 },

    // Expenses - Sales & Marketing
    { id: "5201", code: "5300", name: "إعلانات ممولة", type: "Expense", group: "مصروفات بيعية وتسويقية", parentId: null, level: 2 },
    { id: "5202", code: "5301", name: "توصيل للزبائن", type: "Expense", group: "مصروفات بيعية وتسويقية", parentId: null, level: 2 },
];

export const JOURNAL_ENTRIES = [
    {
        id: "JRN-001",
        entryNumber: "JRN-001",
        date: "2024-02-01",
        description: "إثبات رأس المال",
        reference: "INV-CAPITAL-001",
        status: "posted",
        lines: [
            { accountId: "1201", accountCode: "1400", accountName: "النقد وما في حكمه", debit: 100000.00, credit: 0, description: "استلام رأس المال نقداً" },
            { accountId: "3001", accountCode: "3200", accountName: "رأس المال", debit: 0, credit: 100000.00, description: "إثبات رأس المال" }
        ],
        totalDebit: 100000.00,
        totalCredit: 100000.00,
        createdBy: "system",
        createdAt: "2024-02-01T10:00:00Z",
        postedBy: "admin",
        postedAt: "2024-02-01T10:05:00Z"
    },
    {
        id: "JRN-002",
        entryNumber: "JRN-002",
        date: "2024-02-05",
        description: "شراء أثاث مكتبي",
        reference: "INV-FA-001",
        status: "posted",
        lines: [
            { accountId: "1000", accountCode: "1100", accountName: "الأصول الثابتة - بالتكلفة", debit: 2500.00, credit: 0, description: "شراء أثاث مكتبي" },
            { accountId: "1201", accountCode: "1400", accountName: "النقد وما في حكمه", debit: 0, credit: 2500.00, description: "دفع نقدي" }
        ],
        totalDebit: 2500.00,
        totalCredit: 2500.00,
        createdBy: "accountant_1",
        createdAt: "2024-02-05T14:30:00Z",
        postedBy: "admin",
        postedAt: "2024-02-05T15:00:00Z"
    },
];

export const RECEIPTS = [
    { id: "REC-001", date: "2024-02-02", reference: "REF-001", receivedIn: "نقد في الصندوق", payer: "شركة الأفق للتقنية", description: "سداد فاتورة INV-001", amount: 1500.00 },
    { id: "REC-002", date: "2024-02-06", reference: "REF-002", receivedIn: "المصرف التجاري", payer: "محلات الرواد", description: "ددفعة مقدمة", amount: 1000.00 },
];

export const PAYMENTS = [
    { id: "PAY-001", date: "2024-02-03", reference: "REF-101", paidFrom: "نقد في الصندوق", payee: "شركة النقل السريع", description: "مصاريف شحن", amount: 200.00 },
    { id: "PAY-002", date: "2024-02-07", reference: "REF-102", paidFrom: "المصرف التجاري", payee: "شركة الكهرباء", description: "فاتورة كهرباء", amount: 450.00 },
];

export const TRANSFERS = [
    { id: "TRF-001", date: "2024-02-04", reference: "AUTO", paidFrom: "المصرف التجاري", receivedIn: "نقد في الصندوق", description: "تغذية الخزينة", amount: 5000.00 },
];

export const EMPLOYEES = [
    { id: "EMP-001", name: "محمد علي", code: "E001", position: "مدير مبيعات", email: "mohamed@example.com", status: "Active" },
    { id: "EMP-002", name: "أحمد سالم", code: "E002", position: "موظف مخزن", email: "ahmed@example.com", status: "Active" },
];

export const PRODUCTION_ORDERS = [
    { id: "PO-001", date: "2024-02-01", reference: "PO-1001", finishedItem: "طاولة مكتبية", quantity: 10, status: "كتمل" },
    { id: "PO-002", date: "2024-02-05", reference: "PO-1002", finishedItem: "كرسي جلد", quantity: 25, status: "قيد التنفيذ" },
];

export const PAYSLIPS = [
    { id: "PS-001", date: "2024-01-31", employee: "محمد علي", earnings: 3500.00, deductions: 150.00, netPay: 3350.00 },
    { id: "PS-002", date: "2024-01-31", employee: "أحمد سالم", earnings: 2000.00, deductions: 100.00, netPay: 1900.00 },
];

export const PAY_ITEMS = [
    { id: "1", name: "راتب أساسي", type: "Earning" },
    { id: "2", name: "بدل مواصلات", type: "Earning" },
    { id: "3", name: "ضريبة دخل", type: "Deduction" },
    { id: "4", name: "خصم سلفة", type: "Deduction" },
];

export const FIXED_ASSETS = [
    { id: "FA-001", name: "سيارة نقل", code: "CAR-01", purchaseCost: 25000.00, depreciation: 5000.00, bookValue: 20000.00, rate: "20%" },
    { id: "FA-002", name: "أجهزة كمبيوتر", code: "IT-01", purchaseCost: 5000.00, depreciation: 1000.00, bookValue: 4000.00, rate: "25%" },
];

export const DEPRECIATION_ENTRIES = [
    { id: "DEP-001", date: "2024-01-31", description: "إهلاك شهر يناير", amount: 450.00 },
];

export const CAPITAL_ACCOUNTS = [
    { id: "CAP-001", name: "الشريك الأول", code: "O-01", balance: 50000.00 },
    { id: "CAP-002", name: "الشريك الثاني", code: "O-02", balance: 50000.00 },
];

export const BANK_ACCOUNTS = [
    { id: "BA-001", name: "المصرف التجاري الوطني", code: "B001", currency: "LYD", balance: 145000.00, accountNumber: "123-456-789" },
    { id: "BA-002", name: "صندوق النقد الرئيسي", code: "C001", currency: "LYD", balance: 5400.00, accountNumber: "N/A" },
];

export const INTANGIBLE_ASSETS = [
    { id: "IA-001", name: "برنامج المحاسبة", code: "SOFT-01", acquisitionCost: 1500.00, amortization: 300.00, bookValue: 1200.00, rate: "20%" },
    { id: "IA-002", name: "العلامة التجارية", code: "BRAND-01", acquisitionCost: 5000.00, amortization: 0.00, bookValue: 5000.00, rate: "0%" },
];

export const AMORTIZATION_ENTRIES = [
    { id: "AMR-001", date: "2024-01-31", description: "إطفاء البرمجيات - يناير", amount: 124.00 },
];
