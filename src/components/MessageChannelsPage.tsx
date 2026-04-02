import { Bot } from 'lucide-react';

type ImChannel = {
  name: string;
  logo: string;
  logoImage?: string;
  logoPlateClass?: string;
  logoPlateSize?: string;
  logoImageSize?: string;
  description: string;
  accent: string;
  brandText: string;
  badgeClass: string;
  panelClass: string;
};

const imChannels: ImChannel[] = [
  { name: '微信', logo: '微', logoImage: '/channel-logos/weixin.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#3fbf5a]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '连接个人微信生态，适合把 AI 助理放进高频日常对话入口，用于问答咨询、信息检索、个人助手和轻量服务触达。', accent: 'text-[#3fbf5a]', brandText: '微信', badgeClass: 'bg-[#3fbf5a]/12', panelClass: 'border-[#3fbf5a]/20 bg-gradient-to-br from-[#3fbf5a]/18 to-[#3fbf5a]/6' },
  { name: '企业微信', logo: '企', logoImage: '/channel-logos/qiyeweixin.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#2d7df6]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合团队内部问答、流程协作、知识检索和业务消息触达，常用于客服、员工助手、企业知识库和内部服务入口。', accent: 'text-[#2d7df6]', brandText: '企业微信', badgeClass: 'bg-[#2d7df6]/12', panelClass: 'border-[#2d7df6]/20 bg-gradient-to-br from-[#2d7df6]/18 to-[#2d7df6]/6' },
  { name: 'QQ', logo: 'Q', logoImage: '/channel-logos/qq.svg', logoPlateClass: 'bg-[#F5F7FA] border border-white/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '覆盖传统社群和熟人沟通场景，适合机器人问答、群内互动、社群运营和面向年轻用户的消息辅助服务。', accent: 'text-[#111111]', brandText: 'QQ', badgeClass: 'bg-[#111111]/8', panelClass: 'border-white/10 bg-gradient-to-br from-white/12 to-white/4' },
  { name: '飞书', logo: '飞', logoImage: '/channel-logos/feishu.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#2563eb]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合文档、消息、工作流联动，把 AI 助手嵌进团队协作中，常见于审批协同、会议助手、知识问答和自动化流程。', accent: 'text-[#2563eb]', brandText: '飞书', badgeClass: 'bg-[#2563eb]/10', panelClass: 'border-[#2563eb]/20 bg-gradient-to-br from-[#2563eb]/18 to-[#14b8a6]/6' },
  { name: 'LARK', logo: 'L', logoImage: '/channel-logos/feishu.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#06b6d4]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '面向国际化团队的消息协作入口，适合多地区统一接入，可用于跨区域团队问答、知识检索和统一工作流助手。', accent: 'text-[#06b6d4]', brandText: 'LARK', badgeClass: 'bg-[#06b6d4]/10', panelClass: 'border-[#06b6d4]/20 bg-gradient-to-br from-[#06b6d4]/18 to-[#2d7df6]/6' },
  { name: '钉钉', logo: '钉', logoImage: '/channel-logos/dingding.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#1677ff]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合企业通知、审批协作、内部服务机器人和员工问答场景，常用于组织内部流程消息、智能问答和办公入口整合。', accent: 'text-[#1677ff]', brandText: '钉钉', badgeClass: 'bg-[#1677ff]/10', panelClass: 'border-[#1677ff]/20 bg-gradient-to-br from-[#1677ff]/18 to-[#1677ff]/6' },
  { name: 'Discord', logo: 'D', logoImage: '/channel-logos/discord.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#5865f2]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合社区运营、机器人助手、开发者社群和命令式交互，常用于海外社区管理、AI 机器人指令和自动化通知。', accent: 'text-[#5865f2]', brandText: 'Discord', badgeClass: 'bg-[#5865f2]/10', panelClass: 'border-[#5865f2]/20 bg-gradient-to-br from-[#5865f2]/18 to-[#5865f2]/6' },
  { name: 'Telegram', logo: 'T', logoImage: '/channel-logos/telegram.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#229ed9]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '机器人生态成熟，适合快速搭建跨地区消息助手和通知系统，常用于问答机器人、订阅推送和多地区用户触达。', accent: 'text-[#229ed9]', brandText: 'Telegram', badgeClass: 'bg-[#229ed9]/10', panelClass: 'border-[#229ed9]/20 bg-gradient-to-br from-[#229ed9]/16 to-[#229ed9]/5' },
  { name: 'WhatsApp', logo: 'W', logoImage: '/channel-logos/whatsapp.svg', logoPlateClass: 'bg-[#F5F7FA] border border-[#5fcb5c]/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合海外用户服务、自动回复、销售咨询和客户支持场景，便于把 AI 助手接入更直接的客户沟通链路。', accent: 'text-[#5fcb5c]', brandText: 'WhatsApp', badgeClass: 'bg-[#5fcb5c]/10', panelClass: 'border-[#5fcb5c]/20 bg-gradient-to-br from-[#5fcb5c]/16 to-[#5fcb5c]/5' },
  { name: 'iMessage', logo: 'i', logoImage: '/channel-logos/imessage.svg', logoPlateClass: 'bg-[#F5F7FA] border border-white/15', logoPlateSize: 'h-14 w-14 rounded-2xl', logoImageSize: 'h-14 w-14', description: '适合苹果设备生态内的个人化助手和轻量消息触达体验，可用于设备内提醒、轻问答和个人工作流辅助。', accent: 'text-[#111111]', brandText: 'I Message', badgeClass: 'bg-[#111111]/8', panelClass: 'border-white/10 bg-gradient-to-br from-white/12 to-white/4' },
];

export default function MessageChannelsPage() {
  return (
    <section className="relative overflow-hidden">
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
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {imChannels.map((channel) => (
            <article key={channel.name} className="rounded-[32px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20">
              <div className={`rounded-[24px] border px-8 py-5 ${channel.panelClass}`}>
                {channel.logoImage ? (
                  <div className="flex min-h-[76px] items-center justify-center gap-3">
                    <div className={`flex items-center justify-center ${channel.logoPlateSize || 'h-14 w-14 rounded-2xl'} ${channel.logoPlateClass || 'bg-[#F5F7FA] border border-white/15'}`}>
                      <img src={channel.logoImage} alt={channel.name} className={`${channel.logoImageSize || 'h-14 w-14'} object-contain`} />
                    </div>
                    <div className="min-h-[30px] text-left text-[30px] font-black tracking-tight text-white">
                      {channel.brandText}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[76px] items-center justify-center gap-3">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-[28px] font-black ${channel.badgeClass} ${channel.accent}`}>
                      {channel.logo}
                    </div>
                    <div className="min-h-[30px] text-left text-[30px] font-black tracking-tight text-white">
                      {channel.brandText}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 pt-6">
                <p className="min-h-[112px] text-sm leading-8 text-gray-400">{channel.description}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#/detail/claude-3-5-launch?from=%23/channels';
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#1ed661]/25 bg-[#1ed661]/10 px-4 py-2 text-xs font-semibold text-[#9af0b6] transition-colors hover:bg-[#1ed661]/16"
                  >
                    查看教程
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
