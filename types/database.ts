export type UserRole = 'admin' | 'gestionnaire' | 'lecture'

export type RegistrationStatus = 'draft' | 'validated' | 'cancelled'
export type SeasonStatus = 'draft' | 'open' | 'closed'
export type InstallmentStatus = 'planned' | 'received' | 'cashed' | 'cancelled'
export type PaymentMode = 'CHEQUE' | 'LIQUIDE' | 'VIREMENT' | 'CB' | 'AUTRE'
export type LineType = 'COTISATION' | 'ACTIVITE'

export interface Association {
  id: string
  name: string
  address_line1?: string
  address_line2?: string
  postal_code?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  currency?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  association_id: string
  role: UserRole
  display_name: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Season {
  id: string
  association_id: string
  label: string
  start_date: string
  end_date: string
  status: SeasonStatus
  created_at: string
  updated_at: string
}

export interface Household {
  id: string
  association_id: string
  name: string
  responsible_firstname?: string
  responsible_lastname?: string
  email?: string
  phone?: string
  address_line1?: string
  address_line2?: string
  postal_code?: string
  city?: string
  country?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Subscriber {
  id: string
  association_id: string
  household_id?: string
  firstname: string
  lastname: string
  date_of_birth?: string
  gender?: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  household?: Household
}

export interface Activity {
  id: string
  association_id: string
  season_id?: string
  name: string
  description?: string
  base_price: number
  capacity?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  association_id: string
  season_id: string
  subscriber_id: string
  registration_number?: string
  status: RegistrationStatus
  registration_date: string
  total_gross: number
  total_discount: number
  total_net: number
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  subscriber?: Subscriber
  season?: Season
  lines?: RegistrationLine[]
  installments?: Installment[]
}

export interface RegistrationLine {
  id: string
  registration_id: string
  line_type: LineType
  activity_id?: string
  label: string
  amount: number
  metadata?: any
  created_at: string
  activity?: Activity
}

export interface Installment {
  id: string
  registration_id: string
  rank: number
  due_date: string
  amount: number
  status: InstallmentStatus
  created_at: string
  updated_at: string
  planned_payments?: PlannedPayment[]
}

export interface PlannedPayment {
  id: string
  installment_id: string
  payment_mode: PaymentMode
  amount: number
  bank_name?: string
  check_number?: string
  check_holder?: string
  remittance_date?: string
  receipt_number?: string
  reference?: string
  status: InstallmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface ImportJob {
  id: string
  association_id: string
  filename: string
  status: string
  total_rows: number
  successful_rows: number
  failed_rows: number
  error_log?: any
  created_at: string
  created_by?: string
}

export interface ExportJob {
  id: string
  association_id: string
  export_type: string
  filters?: any
  filename?: string
  status: string
  created_at: string
  created_by?: string
}

export interface DashboardStats {
  totalRegistrations: number
  totalExpected: number
  totalCashed: number
  upcomingInstallments: number
  overdueInstallments: number
}
