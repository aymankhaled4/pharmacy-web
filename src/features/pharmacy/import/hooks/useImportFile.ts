import { useMutation } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { ImportResult, QueuedImport } from '../types/import.types';

export function useImportFile() {
    return useMutation<ImportResult | QueuedImport, string, File>({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.post(ENDPOINTS.PHARMACY_INVENTORY_IMPORT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
    });
}
