import { LoginForm } from "./login-form";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Sign In</h1>
                    <p className="text-muted-foreground">
                        Enter your credentials to access your account
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}