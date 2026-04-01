import { Bot } from 'lucide-react';

type ImChannel = {
  name: string;
  logo: string;
  description: string;
  accent: string;
  brandText: string;
  badgeClass: string;
};

const imChannels: ImChannel[] = [
  { name: '微信', logo: '微', description: '连接个人微信生态，把 AI 助理放进高频日常对话入口。', accent: 'text-[#3fbf5a]', brandText: '微信', badgeClass: 'bg-[#3fbf5a]/12' },
  { name: '企业微信', logo: '企', description: '适合团队内部问答、流程协作、知识检索和业务消息触达。', accent: 'text-[#2d7df6]', brandText: '企业微信', badgeClass: 'bg-[#2d7df6]/12' },
  { name: 'QQ', logo: 'Q', description: '覆盖传统社群和熟人沟通场景，适合机器人问答与群内互动。', accent: 'text-[#111111]', brandText: 'QQ', badgeClass: 'bg-[#111111]/8' },
  { name: '飞书', logo: '飞', description: '适合文档、消息、工作流联动，把 AI 助手嵌进团队协作中。', accent: 'text-[#2563eb]', brandText: '飞书', badgeClass: 'bg-[#2563eb]/10' },
  { name: 'LARK', logo: 'L', description: '面向国际化团队的消息协作入口，适合多地区统一接入。', accent: 'text-[#06b6d4]', brandText: 'LARK', badgeClass: 'bg-[#06b6d4]/10' },
  { name: '钉钉', logo: '钉', description: '适合企业通知、审批协作、内部服务机器人和员工问答场景。', accent: 'text-[#1677ff]', brandText: '钉钉', badgeClass: 'bg-[#1677ff]/10' },
  { name: 'Discord', logo: 'D', description: '适合社区运营、机器人助手、开发者社群和命令式交互。', accent: 'text-[#5865f2]', brandText: 'Discord', badgeClass: 'bg-[#5865f2]/10' },
  { name: 'Telegram', logo: 'T', description: '机器人生态成熟，适合快速搭建跨地区消息助手和通知系统。', accent: 'text-[#229ed9]', brandText: 'Telegram', badgeClass: 'bg-[#229ed9]/10' },
  { name: 'WhatsApp', logo: 'W', description: '适合海外用户服务、自动回复、销售咨询和客户支持场景。', accent: 'text-[#5fcb5c]', brandText: 'WhatsApp', badgeClass: 'bg-[#5fcb5c]/10' },
  { name: 'iMessage', logo: 'i', description: '适合苹果设备生态内的个人化助手和轻量消息触达体验。', accent: 'text-[#111111]', brandText: 'I Message', badgeClass: 'bg-[#111111]/8' },
];

export default function MessageChannelsPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top,rgba(30,214,97,0.16),transparent_58%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-14 md:pt-20">
        <header className="mx-auto mb-14 flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1ed661]/20 bg-[#1ed661]/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#86efac]">
            <Bot className="h-4 w-4" />
            常见 IM 平台接入与教程入口
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-6xl">
            消息渠道
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9">
            快速搭建专属 AI 助理，回答问题、搜索信息、执行任务、聪明响应。
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-400 md:text-base">
            把 OpenClaw 接入常用 IM 平台后，用户就可以直接在熟悉的聊天入口里发起提问和调用能力。
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {imChannels.map((channel) => (
            <article key={channel.name} className="rounded-[32px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20">
              <div className="rounded-[24px] bg-[#f3f6fb] px-8 py-12">
                <div className="flex items-center justify-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${channel.badgeClass} ${channel.accent}`}>
                    {channel.logo}
                  </div>
                  <div className={`text-4xl font-black tracking-tight ${channel.accent}`}>
                    {channel.brandText}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-6">
                <p className="min-h-[84px] text-sm leading-8 text-gray-400">{channel.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/detail/claude-3-5-launch?from=%23/channels';
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-[#1ed661]/25 bg-[#1ed661]/10 px-5 py-3 text-sm font-semibold text-[#9af0b6] transition-colors hover:bg-[#1ed661]/16"
                >
                  查看教程
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
