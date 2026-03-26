import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    // 保護すべきルートを指定（api/auth, 静的ファイルなどは除外）
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
