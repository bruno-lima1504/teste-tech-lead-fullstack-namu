/** Formato único de erro da API. */
export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
