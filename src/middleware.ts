import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host')?.toLowerCase();

  if (host === 'www.fistik.kz') {
    const url = request.nextUrl.clone();
    url.host = 'fistik.kz';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith('/admin')) {
    return updateSession(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(kk|tr|ru|en)/:path*', '/admin/:path*'],
};
