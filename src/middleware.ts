import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Admin pages require ADMIN or COMMITTEE role
      if (path.startsWith("/admin")) {
        return token?.role === "ADMIN" || token?.role === "COMMITTEE";
      }

      // Create and profile pages require authentication
      if (path.startsWith("/create") || path.startsWith("/profile")) {
        return !!token;
      }

      // All other pages are public
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: ["/create/:path*", "/profile/:path*", "/admin/:path*"],
};
