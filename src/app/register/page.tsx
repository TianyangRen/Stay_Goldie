import Link from "next/link";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Create your account"
      description="Pet owners can add dog profiles, book boarding, and shop once registered."
      footer={
        <p className="text-center text-xs text-zinc-500">
          By registering you agree to our{" "}
          <Link href="/privacy" className="text-[var(--sg-green)] underline underline-offset-4">
            Privacy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-[var(--sg-green)] underline underline-offset-4">
            Terms
          </Link>
          .
        </p>
      }
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
