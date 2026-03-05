import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is logged in but has no firstName, redirect to complete profile
    // (unless they're already on the complete-profile page or an API route)
    if (
      token &&
      !token.firstName &&
      !path.startsWith("/auth/complete-profile") &&
      !path.startsWith("/api/")
    ) {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        // Admin pages require ADMIN or COMMITTEE role
        if (path.startsWith("/admin")) {
          return token?.role === "ADMIN" || token?.role === "COMMITTEE";
        }

        // Create, profile, and complete-profile pages require authentication
        if (path.startsWith("/create") || path.startsWith("/profile") || path.startsWith("/auth/complete-profile")) {
          return !!token;
        }

        // All other pages are public
        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/create/:path*", "/profile/:path*", "/admin/:path*", "/auth/complete-profile/:path*"],
};
