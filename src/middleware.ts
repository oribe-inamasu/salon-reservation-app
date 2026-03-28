import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth } = NextAuth(authConfig)

export default auth;

export const config = {
    // 保護すべきルートを指定（api/auth, api/webhook, 静的ファイルなどは除外）
    matcher: ["/((?!api/auth|api/webhook|_next/static|_next/image|favicon.ico).*)"],
}
