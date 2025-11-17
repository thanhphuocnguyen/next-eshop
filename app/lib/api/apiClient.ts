import { badRequestHandler } from '@/app/utils';
import { GenericResponse } from '../definitions/index';
import { refreshTokenAction } from '@/app/actions/auth';
import Cookies from 'js-cookie';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  authToken?: string;
  nextOptions?: RequestInit;
  retryOnUnauthorized?: boolean;
  req?: unknown; // For SSR cookie access
  res?: unknown;
  queryParams?: Record<string, unknown>; // Added queryParams option
};

// Helper function to serialize query parameters
function serializeQueryParams(params: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          searchParams.append(`${key}[]`, String(item));
        }
      });
    } else if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function clientSideFetch<T = unknown>(
  endpoint: string,
  {
    method = 'GET',
    body,
    headers = {},
    nextOptions = {},
    retryOnUnauthorized = true,
    req,
    res,
    queryParams,
  }: RequestOptions = {}
): Promise<GenericResponse<T>> {
  // Build the URL with query parameters if provided
  let fullUrl = endpoint.startsWith('http')
    ? endpoint
    : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${endpoint}`;

  // Append query parameters if they exist
  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = serializeQueryParams(queryParams);
    fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
  }

  const isFormData = body instanceof FormData;

  const token = Cookies.get('accessToken');
  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(fullUrl, {
    method,
    headers: finalHeaders,
    body: body && !isFormData ? JSON.stringify(body) : (body as BodyInit),
    ...nextOptions,
  });

  if (response.status === 401) {
    if (retryOnUnauthorized) {
      const newToken = await refreshTokenAction();
      if (newToken) {
        return clientSideFetch<T>(endpoint, {
          method,
          body,
          headers,
          nextOptions,
          retryOnUnauthorized: false,
          req,
          res,
        });
      } else {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('sessionId');
        throw new Error('Authentication refresh failed: no new token');
      }
    } else {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('sessionId');
      throw new Error('Authentication refresh failed: unauthorized');
    }
  }

  badRequestHandler(response);

  // Check if response has a JSON Content-Type and is not empty before parsing
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    // Handle empty response body (204 No Content, etc.)
    const text = await response.text();
    if (!text) {
      // Return an empty object or null, depending on your API contract
      return {} as GenericResponse<T>;
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      // If JSON parsing fails, return a consistent error structure
      return {
        success: false,
        data: null,
        error: 'Invalid JSON response',
      } as unknown as GenericResponse<T>;
    }
  } else {
    // For non-JSON responses, return as text or a consistent error structure
    const text = await response.text();
    return {
      success: false,
      data: null,
      error: 'Response is not JSON',
      raw: text,
    } as unknown as GenericResponse<T>;
  }
}
