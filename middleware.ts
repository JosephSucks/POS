import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only protect /pos route
  if (pathname.startsWith('/pos')) {
    const isLoggedIn = request.cookies.get('pos-logged-in')?.value

    // If not logged in, redirect to login page
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/pos/:path*'],
}
