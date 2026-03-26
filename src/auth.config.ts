import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [], // Providers are added in the main auth.ts for full functionality
    session: { strategy: "jwt" },
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLoginPage = nextUrl.pathname.startsWith("/login")
            const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
            const isApiSeedRoute = nextUrl.pathname.startsWith("/api/seed")

            if (isApiAuthRoute || isApiSeedRoute) return true

            if (isOnLoginPage) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
                return true
            }

            return isLoggedIn // If not logged in and not on login page, redirect to login
        },
    },
} satisfies NextAuthConfig
