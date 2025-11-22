import { NextRequest } from 'next/server';
import { i18nMiddleware } from '@/lib/i18n/middleware';

export function proxy(request: NextRequest) {
  return i18nMiddleware(request)
}


export const config = {
  matcher: [
    { source: '/' },
    { source: '/account/:path*' },
    { source: '/consent/:path*' },
    { source: '/email-confirmation/:path*' },
    { source: '/email-confirmed/:path*' },
    { source: '/login/:path*' },
    { source: '/logout/:path*' },
    { source: '/register/:path*' },
  ],
};
