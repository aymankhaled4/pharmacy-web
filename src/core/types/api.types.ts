export interface ApiMeta {
  total?: number;
  limit?: number;
  cursor?: string | null;
  next_cursor?: string | null;
  has_more?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface CursorListResult<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ApiError {
  message?: string;
  code?: string;
  statusCode?: number;
}
