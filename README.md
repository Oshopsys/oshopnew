# Oshop - Modern Accounting System

A comprehensive accounting and inventory management system built with Next.js, TypeScript, and Supabase.

## 🌟 Features

### 📊 Accounting & Finance
- **Chart of Accounts** - Complete hierarchical account structure
- **Journal Entries** - Manual and automatic journal entry management
- **General Ledger** - Comprehensive ledger reports
- **Financial Reports** - Balance Sheet, Income Statement, Trial Balance

### 💰 Treasury Management
- **Bank Accounts** - Multi-currency bank account management
- **Receipts & Payments** - Complete cash flow tracking
- **Inter-Account Transfers** - Transfer between bank accounts

### 📦 Inventory Management
- **Inventory Items** - Products and services catalog
- **Inventory Tracking** - FIFO-based inventory layers
- **Inventory Transactions** - Complete movement history

### 🧾 Sales & Purchases
- **Sales Invoices** - Customer invoicing with automatic accounting
- **Purchase Invoices** - Supplier invoices with inventory updates
- **Partners Management** - Customers and suppliers database

### 👥 HR & Payroll
- **Employees** - Employee records management
- **Payslips** - Salary processing and tracking

### 🏭 Fixed Assets
- **Fixed Assets** - Asset tracking and depreciation
- **Intangible Assets** - Intangible asset management and amortization

### 📝 Activity Logs
- **Automatic Audit Trail** - Track all changes to key entities
- **Change History** - View create, update, and delete operations

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/oshop.git
cd oshop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:
   - Navigate to your Supabase SQL Editor
   - Execute the scripts in the `scripts/` folder in order

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
oshop/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── actions/      # Server actions
│   │   ├── bank-accounts/
│   │   ├── sales-invoices/
│   │   ├── journal-entries/
│   │   └── ...
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utility functions
│   │   ├── supabase.ts  # Supabase client
│   │   └── utils.ts     # Helper functions
│   └── types/           # TypeScript type definitions
├── scripts/             # Database migration scripts
├── public/              # Static assets
└── supabase/            # Supabase configuration
```

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- `chart_of_accounts` - Hierarchical account structure
- `journal_entries` & `journal_entry_lines` - Double-entry bookkeeping
- `invoices` & `invoice_lines` - Sales and purchase invoices
- `treasury_transactions` - Receipts and payments
- `inventory_items` - Product catalog
- `inventory_transactions` & `inventory_layers` - Inventory tracking
- `partners` - Customers and suppliers
- `employees` - Employee records
- `bank_accounts` - Bank account management
- `activity_logs` - Audit trail

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Secure server-side actions
- Environment variable protection
- SQL injection prevention through parameterized queries

## 📊 Key Features

### Automatic Journal Entry Generation
Every transaction (invoice, receipt, payment) automatically generates proper journal entries following double-entry bookkeeping principles.

### FIFO Inventory Costing
Inventory uses First-In-First-Out (FIFO) method for accurate cost tracking and valuation.

### Activity Logging
Database triggers automatically log all changes to:
- Inventory items
- Bank accounts
- Employees
- Partners

## 🌐 Localization

The system is fully localized in Arabic (RTL support) with:
- Arabic UI labels
- Arabic number formatting
- Arabic date formatting
- RTL-optimized layouts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for modern accounting needs

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- Supabase for the backend infrastructure
- Next.js team for the amazing framework
