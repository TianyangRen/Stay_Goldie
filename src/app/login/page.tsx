import { Suspense } from "react";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthFormShell
      title="登录"
      description="使用邮箱与密码登录（Auth.js Credentials + PostgreSQL）。管理员账号可进入后台。"
    >
      <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
        <LoginForm />
      </Suspense>
    </AuthFormShell>
  );
}
