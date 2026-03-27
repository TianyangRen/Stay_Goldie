import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="section-wrap py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">登录</h1>
        <p className="mt-2 text-sm text-zinc-600">
          使用邮箱与密码登录（Auth.js Credentials + PostgreSQL）。管理员账号可进入后台。
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">加载中…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
