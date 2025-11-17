import { PUBLIC_API_PATHS } from '@/app/lib/constants/api';
import { RefreshTokenResponse } from '@/app/lib/definitions/auth';
import { NextRequest, NextResponse } from 'next/server';
import { GenericResponse } from './app/lib/definitions';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export type JwtModel = {
  roleCode: string;
  roleId: string;
  username: string;
  userId: string;
  id: string;
} & JwtPayload;

const AdminPath = '/admin';
const clearCookies = (response: NextResponse) => {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('sessionId');
}
export async function middleware(request: NextRequest) {
  const privatePaths = ['/profile', '/checkout', '/cart', '/orders'];
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const response = NextResponse.next();
  if (
    !accessToken &&
    refreshToken &&
    privatePaths.some((route) => path.startsWith(route))
  ) {
    const refreshResult = await fetch(PUBLIC_API_PATHS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    if (!refreshResult.ok) {
      const response = NextResponse.redirect(
        new URL('/login', request.nextUrl)
      );
      clearCookies(response);
      return response;
    }

    const { data, error }: GenericResponse<RefreshTokenResponse> =
      await refreshResult.json();
    if (error) {
      clearCookies(response);
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    response.cookies.set('accessToken', data.accessToken, {
      expires: new Date(data.accessTokenExpiresAt),
    });
    return response;
  }
  if (path.startsWith(AdminPath) && accessToken) {
    const decode = jwtDecode<JwtModel>(accessToken || '');
    if (decode['roleCode'] !== 'admin') {
      return NextResponse.redirect(new URL('/not-found', request.nextUrl));
    }
  }
  const isProtectedRoute = privatePaths.some((route) => path.startsWith(route));

  if (isProtectedRoute && !request.cookies.get('accessToken')?.value) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return response;
}
