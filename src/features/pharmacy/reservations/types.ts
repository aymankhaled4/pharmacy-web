export type ReservationStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled'

export interface PharmacyReservation {
  id: string
  short_code: string
  quantity: number
  price_at_reservation: number
  discount_at_reservation: number
  total_price: number
  status: ReservationStatus
  expires_at: string
  created_at: string
  confirmed_at?: string
  user: {
    full_name: string
    phone: string
  }
  inventory: {
    drug: {
      brand_name: string
      brand_name_ar: string
      strength: string
      dosage_form?: string
    }
  }
}
