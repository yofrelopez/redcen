import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)
// export default function middleware() {} // Pass through

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*opengraph-image|.*\\.png$).*)"],
}

export default NextAuth(authConfig).auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    // Protect /dashboard/admin routes
    if (nextUrl.pathname.startsWith('/dashboard/admin')) {
        if (!isLoggedIn) {
            return Response.redirect(new URL('/login', nextUrl))
        }

        if (req.auth?.user?.role !== 'ADMIN') {
            return Response.redirect(new URL('/dashboard', nextUrl))
        }
    }
})
