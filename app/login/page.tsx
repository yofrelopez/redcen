import { Card } from "@/components/ui/card"
import { LoginHeader } from "@/components/auth/login-header"
import { LoginForm } from "@/components/auth/login-form"
import { LoginFooter } from "@/components/auth/login-footer"
import { Toaster } from "sonner"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <Toaster position="top-center" richColors />
            <Card className="w-full max-w-md shadow-xl border-gray-100 overflow-hidden">
                <LoginHeader />
                <LoginForm />
                <LoginFooter />
            </Card>
        </div>
    )
}
