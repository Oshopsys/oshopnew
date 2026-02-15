export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            partners: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH'
                    email: string | null
                    phone: string | null
                    tax_number: string | null
                    address: string | null
                    credit_limit: number | null
                    currency: string | null
                    payment_terms: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH'
                    email?: string | null
                    phone?: string | null
                    tax_number?: string | null
                    address?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['partners']['Insert']>
            }
            bank_accounts: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    account_number: string | null
                    bank_name: string | null
                    currency: 'LYD' | 'USD' | 'EUR' | null
                    gl_account_id: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    account_number?: string | null
                    bank_name?: string | null
                    currency?: 'LYD' | 'USD' | 'EUR' | null
                    gl_account_id: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['bank_accounts']['Insert']>
            }
            inventory_items: {
                Row: {
                    id: string
                    name: string
                    code: string
                    description: string | null
                    type: string | null
                    sales_price: number | null
                    cost_price: number | null
                    quantity_on_hand: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    description?: string | null
                    type?: string | null
                    sales_price?: number | null
                    cost_price?: number | null
                    quantity_on_hand?: number | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>
            }
            invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    type: 'SALE' | 'PURCHASE'
                    date: string
                    due_date: string | null
                    partner_id: string | null
                    status: 'DRAFT' | 'POSTED' | 'PAID' | 'VOID' | null
                    total: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_number: string
                    type: 'SALE' | 'PURCHASE'
                    date: string
                    due_date?: string | null
                    partner_id?: string | null
                    status?: 'DRAFT' | 'POSTED' | 'PAID' | 'VOID' | null
                    total?: number | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['invoices']['Insert']>
            }
            employees: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    position: string | null
                    email: string | null
                    status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    position?: string | null
                    email?: string | null
                    status?: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE' | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['employees']['Insert']>
            }
            assets: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    type: 'TANGIBLE' | 'INTANGIBLE' | null
                    purchase_cost: number
                    book_value: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    type?: 'TANGIBLE' | 'INTANGIBLE' | null
                    purchase_cost: number
                    created_at?: string
                }
            }
            journal_entries: {
                Row: {
                    id: string
                    transaction_date: string
                    reference: string | null
                    description: string | null
                    status: 'DRAFT' | 'POSTED' | 'ARCHIVED'
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_date: string
                    reference?: string | null
                    description?: string | null
                    status?: 'DRAFT' | 'POSTED' | 'ARCHIVED'
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>
            }
            journal_entry_lines: {
                Row: {
                    id: string
                    entry_id: string | null
                    account_id: string
                    debit: number
                    credit: number
                    description: string | null
                }
                Insert: {
                    id?: string
                    entry_id?: string | null
                    account_id: string
                    debit?: number
                    credit?: number
                    description?: string | null
                }
                Update: Partial<Database['public']['Tables']['journal_entry_lines']['Insert']>
            }
        }
    }
}
