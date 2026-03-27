export default function ServicesPage() {
  return (
    <section className="section-wrap py-14">
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">寄养服务说明</h1>
        <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-700">
          <li>家庭式寄养环境，每日活动与休息节奏平衡。</li>
          <li>支持多宠家庭同单预约，减少拆单沟通成本。</li>
          <li>可上传疫苗证明与健康信息，提升交接效率。</li>
          <li>可选订金锁定档期，剩余费用入住前结清。</li>
        </ul>
      </div>
    </section>
  );
}
