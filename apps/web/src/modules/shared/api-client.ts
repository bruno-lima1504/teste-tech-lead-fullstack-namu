import type { ApiErrorBody } from './api.types';

const UNREACHABLE_MESSAGE = 'Não foi possível falar com o servidor. Tente de novo.';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  userId?: number;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === 'object' && value !== null && 'code' in value && 'message' in value;

/** Chama a API pelo proxy do Next (/api) e devolve o JSON, ou lança ApiError. */
export async function apiFetch<T>(
  path: string,
  { method = 'GET', userId, body, query = {} }: RequestOptions = {},
): Promise<T> {
  const params = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  const url = `/api${path}${params.size > 0 ? `?${params.toString()}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(userId !== undefined && { 'X-User-Id': String(userId) }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', UNREACHABLE_MESSAGE);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) {
    return payload as T;
  }
  // Sem o corpo de erro da API (ex.: a API fora do ar e o proxy respondendo), a mensagem é genérica.
  if (!isApiErrorBody(payload)) {
    throw new ApiError(response.status, 'NETWORK_ERROR', UNREACHABLE_MESSAGE);
  }
  throw new ApiError(response.status, payload.code, payload.message, payload.details);
}
