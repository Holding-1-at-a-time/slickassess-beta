import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/sign-in", "/sign-up"]

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // In a real implementation, you would check for authentication
  // For now, we'll simulate this with a simple check
  const isAuthenticated = true // This would be a real check in production

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    url.pathname = "/sign-in"
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access auth pages
  if (isAuthenticated && (pathname === "/sign-in" || pathname === "/sign-up")) {
    // Redirect to the first tenant's dashboard
    // In a real implementation, you would get the user's tenants
    const firstTenantId = "demo-tenant"
    url.pathname = `/${firstTenantId}/dashboard`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Define which paths should be checked by the middleware
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, etc.
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
