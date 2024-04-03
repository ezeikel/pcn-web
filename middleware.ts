/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { AUTHENTICATED_PATHS } from './constants';

export const middleware = async (req: NextRequest) => {
  // object added to req from next-auth wrapper this function
  const { pathname } = req.nextUrl;

  // https://stackoverflow.com/a/76749457/2491630
  const session = !!(
    req.cookies.get('authjs.session-token') ||
    // in production it seems to get prefixed with __Secure-
    req.cookies.get('__Secure-authjs.session-token')
  );

  // skip middleware for API routes, images, static files, and specific assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    // home for authenticated users should be dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // home for unauthenticated users should be landing page
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (AUTHENTICATED_PATHS.includes(pathname)) {
    // users must sign in to access pages that require authentication
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // redirect authenticated users away from landing page
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
};
