import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { ImportJobStatus } from '../types/import.types';

export function useImportStatus(jobId: string | null) {
    return useQuery<ImportJobStatus, string>({
        queryKey: ['import-status', jobId],
        queryFn: () => api.get(ENDPOINTS.PHARMACY_INVENTORY_IMPORT_STATUS(jobId!)),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const state = (query.state.data as ImportJobStatus | undefined)?.state;
            if (state === 'completed' || state === 'failed') return false;
            return 3000;
        },
    });
}
