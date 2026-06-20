import type { ApiError } from '@/core/types/api.types';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.message) return apiError.message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
