import Link from "next/link";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="注册"
      description="创建主人账号后即可添加宠物档案、预约寄养与购买商城商品。"
      footer={
        <p className="text-center text-xs text-zinc-500">
          <Link href="/privacy" className="underline underline-offset-4">
            隐私政策
          </Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-4">
            服务条款
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
