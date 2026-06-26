import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    return updateSession(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(kk|tr|ru|en)/:path*', '/admin/:path*'],
};
