import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import type { DrugInfo } from '../types/inventory.types';

/**
 * Searches the drug catalog by name (Arabic or English).
 * Used by AddItemModal for the autocomplete field.
 *
 * Only fires when `query` is non-empty and at least 2 characters —
 * avoids hammering the backend on every keystroke.
 */
export function useDrugSearch(query: string) {
    const trimmed = query.trim();

    return useQuery<DrugInfo[]>({
        queryKey: ['drug-search', trimmed],
        queryFn: () => api.get(`/drugs/search?q=${encodeURIComponent(trimmed)}`),
        enabled: trimmed.length >= 2,
        staleTime: 60 * 1000,
    });
}