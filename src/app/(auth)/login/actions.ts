"use server"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
export async function loginAction(prevState: string | undefined, formData: FormData) {
    try {
        console.log("Login attempt for:", formData.get("email"))
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            console.log("Auth Error Type:", error.type)
            switch (error.type) {
                case "CredentialsSignin":
                    return "メールアドレスまたはパスワードが正しくありません"
                default:
                    return "ログインに失敗しました。もう一度お試しください"
            }
        }
        
        // IMPORTANT: Re-throw the error so Next.js can handle redirects
        // NextAuth throws a redirect on success, which is an error in Server Actions
        console.log("Re-throwing non-auth error:", error)
        throw error
    }
}

export async function signOutAction() {
    await signOut({ redirectTo: "/login" })
}
