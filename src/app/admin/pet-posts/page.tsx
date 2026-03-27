import { prisma } from "@/lib/prisma";
import { PetPostForm } from "@/components/admin/pet-post-form";

export const dynamic = "force-dynamic";

export default async function AdminPetPostsPage() {
  const [pets, posts] = await Promise.all([
    prisma.pet.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.petPost.findMany({
      include: { pet: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：宠物动态发帖</h1>
      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
        <p className="text-sm text-zinc-600">
          上传图片将请求预签名 URL（需配置 S3/R2）。也可直接填写可访问的图片 URL。发布后主人可在「宠物
          Ins」中查看。
        </p>
        {pets.length === 0 ? (
          <p className="mt-4 text-sm text-amber-800">数据库中暂无宠物，请先录入宠物档案。</p>
        ) : (
          <PetPostForm pets={pets} />
        )}
      </div>
      <div className="mt-6 space-y-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-zinc-600"
          >
            <span className="font-medium text-zinc-800">{post.pet.name}</span> · {post.caption}
          </article>
        ))}
      </div>
    </section>
  );
}
