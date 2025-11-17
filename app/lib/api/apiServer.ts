'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { refreshTokenAction } from '@/app/actions/auth';
import { GenericResponse } from '../definitions/index';
import { badRequestHandler, serializeQueryParams } from '@/app/utils';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  authToken?: string;
  nextOptions?: RequestInit;
  retryOnUnauthorized?: boolean;
  req?: Request; // For SSR cookie access
  res?: Response;
  queryParams?: Record<string, unknown>; // Added queryParams option
};

export async function serverSideFetch<T = unknown>(
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
  const cookiesStore = await cookies();
  const token = cookiesStore.get('accessToken')?.value;
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
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (response.status === 401) {
    if (retryOnUnauthorized && !token && refreshToken) {
      const newToken = await refreshTokenAction();
      if (newToken) {
        return serverSideFetch<T>(endpoint, {
          method,
          body,
          headers,
          nextOptions,
          retryOnUnauthorized: false,
          req,
          res,
        });
      } else {
        console.error('Token refresh failed, redirecting to login');
        cookiesStore.delete('accessToken');
        cookiesStore.delete('refreshToken');
        cookiesStore.delete('sessionId');
        redirect('/login');
      }
    } else {
      console.error('Unauthorized request, redirecting to login');
      cookiesStore.delete('accessToken');
      cookiesStore.delete('refreshToken');
      cookiesStore.delete('sessionId');
      redirect('/login');
    }
  }

  badRequestHandler(response);

  return response.json();
}
