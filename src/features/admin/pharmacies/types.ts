export type PharmacyStatus = 'pending' | 'approved' | 'rejected'

export interface AdminPharmacy {
  id: string
  pharmacy_name: string
  license_number: string
  phone: string
  address: string
  city: string
  status: PharmacyStatus
  rejection_reason: string | null
  created_at: string
  verified_at: string | null
  reservation_count?: number
  reservations_count?: number
  total_reservations?: number
  reservations?: number | unknown[]
}
