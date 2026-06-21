export type InventoryStatus = 'active' | 'inactive' | 'expired' | 'out_of_stock';

export interface DrugInfo {
    id: string;
    brand_name: string;
    brand_name_ar?: string;
    generic_name?: string;
    active_ingredient?: string;
    category?: string;
    strength?: string;
    dosage_form?: string;
    manufacturer?: string;
}

export interface InventoryItem {
    id: string;
    pharmacy_id: string;
    drug_id: string;
    batch_number?: string;
    quantity: number;
    expiry_date?: string;
    selling_price: number;
    discount_percent?: number;
    status: InventoryStatus;
    created_at: string;
    updated_at: string;
    drug: DrugInfo;
}

// New cursor pagination response shape from backend
export interface InventoryPage {
    items: InventoryItem[];
    nextCursor: string | null;
    total: number;
}

export interface InventoryFilters {
    search?: string;
    status?: InventoryStatus | '';
    limit?: number;
    cursor?: string;
}

export interface AddInventoryPayload {
    drug_name: string;
    quantity: number;
    selling_price: number;
    expiry_date?: string;
    batch_number?: string;
    discount_percent?: number;
}

export interface UpdateInventoryPayload {
    quantity?: number;
    selling_price?: number;
    expiry_date?: string;
    batch_number?: string;
    discount_percent?: number;
    status?: InventoryStatus;
}
