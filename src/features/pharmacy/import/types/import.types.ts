export interface RowResult {
    drugName: string;
    status: 'matched' | 'auto_created' | 'failed';
    drugId?: string;
    error?: string;
}

export interface ImportResult {
    matched: number;
    autoCreated: number;
    failed: number;
    total: number;
    rows: RowResult[];
}

export interface QueuedImport {
    jobId: string;
    queued: true;
    rowCount: number;
}

export interface ImportJobStatus {
    jobId: string;
    state: 'waiting' | 'active' | 'completed' | 'failed';
    progress: number;
    result: ImportResult | null;
}

export function isQueuedImport(
    data: ImportResult | QueuedImport
): data is QueuedImport {
    return 'jobId' in data && (data as QueuedImport).queued === true;
}
