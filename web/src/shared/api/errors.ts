export interface ApiErrorOptions {
  status?: number;
  details?: unknown;
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, { status, details }: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
