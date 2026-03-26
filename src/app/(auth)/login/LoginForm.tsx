"use client"

import { useActionState } from "react"
import { Lock, Mail, Loader2 } from "lucide-react"
import { loginAction } from "./actions"

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(
        loginAction,
        undefined
    )

    return (
        <form action={formAction} className="space-y-6 relative">
            <div className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        name="email"
                        type="email"
                        placeholder="メールアドレス"
                        className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                        required
                        disabled={isPending}
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        name="password"
                        type="password"
                        placeholder="パスワード"
                        className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>ログイン中...</span>
                    </>
                ) : (
                    <span>ログイン</span>
                )}
            </button>
        </form>
    )
}
