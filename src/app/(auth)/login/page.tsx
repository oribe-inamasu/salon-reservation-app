import { Lock } from "lucide-react"
import LoginForm from "./LoginForm"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
            <div className="w-full max-w-md space-y-8 bg-card p-10 rounded-3xl shadow-2xl border border-border/50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

                <div className="text-center relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6 shadow-inner">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Salon Karte</h1>
                    <p className="text-muted-foreground font-medium">管理者ログイン</p>
                </div>

                <LoginForm />

                <div className="text-center text-sm text-muted-foreground pt-4">
                    <p className="hover:text-primary cursor-pointer transition-colors">パスワードをお忘れの方</p>
                </div>
            </div>
        </div>
    )
}
