import { Suspense } from "react";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Sign in"
      description="Use your email and password (Auth.js credentials with PostgreSQL). Admin users can open the dashboard after signing in."
    >
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthFormShell>
  );
}
