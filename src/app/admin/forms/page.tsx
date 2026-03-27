export default function AdminFormsPage() {
  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：问卷与资料审核</h1>
      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
        <p className="text-sm leading-7 text-zinc-600">
          这里用于配置入托问卷字段、查看健康档案与疫苗证明上传记录。当前保留基础占位，方便后续接入数据库与审核流。
        </p>
      </div>
    </section>
  );
}
