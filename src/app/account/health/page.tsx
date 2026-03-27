import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountHealthPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId },
    include: {
      healthProfile: {
        include: {
          preferredClinics: true,
          vaccineDocuments: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">入托问卷与健康档案</h1>
      <p className="mt-2 text-sm text-zinc-600">
        字段全部可选填写；疫苗证明上传请使用预签名接口写入私有存储。
      </p>
      <div className="mt-8 grid gap-5">
        {pets.map((pet) => {
          const profile = pet.healthProfile;
          const clinic = profile?.preferredClinics[0];
          return (
            <article key={pet.id} className="rounded-3xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">{pet.name}</h2>
              <div className="mt-4 grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
                <p>饮食禁忌：{profile?.dietRestrictions ?? "未填写"}</p>
                <p>药物：{profile?.medications ?? "未填写"}</p>
                <p>社交行为：{profile?.socialBehavior ?? "未填写"}</p>
                <p>紧急联系人：{profile?.emergencyContactName ?? "未填写"}</p>
                <p>兽医信息：{profile?.vetName ?? "未填写"}</p>
                <p>常去宠物医院：{clinic?.clinicName ?? "未填写"}</p>
              </div>
              {profile?.vaccineDocuments.length ? (
                <p className="mt-3 text-xs text-zinc-500">
                  已登记 {profile.vaccineDocuments.length} 份疫苗相关文件（链接由服务端安全存储）。
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
