import { useMemo, useState } from 'react';
import { BadgeCheck, BookOpen, Box, Cloud, Laptop, Rocket, Server, ShieldCheck, TerminalSquare, Zap } from 'lucide-react';

type EnvironmentOption = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  summary: string;
  costLabel: string;
  bestFor: string;
  pros: string[];
  cautions: string[];
  tags?: string[];
  footerItems?: Array<{ label: string; href?: string }>;
  highlights?: string[];
  specs?: Array<{ label: string; value: string }>;
  note?: string;
  ctaLabel?: string;
  ctaHash?: string;
};

type DeployOption = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  summary: string;
  bestFor: string;
  strengths: string[];
  tradeoffs?: string[];
  highlights?: string[];
  command?: string;
  note?: string;
  tutorialHash?: string;
};

const environmentOptions: EnvironmentOption[] = [
  {
    title: '云服务器 / VPS',
    subtitle: '适合长期稳定运行、公网服务和海外轻量部署',
    icon: Cloud,
    accent: 'from-[#4f7cff]/20 to-[#4f7cff]/5 text-[#7ea2ff]',
    summary: '本质上都是在网上租一台一直在线的机器。云服务器更偏完整云厂商体系，VPS 更偏轻量直接的主机形态，二者都适合正式运行和公网访问。',
    costLabel: '¥10-100/月',
    bestFor: '生产环境、团队项目、海外服务、需要 24 小时在线的业务',
    pros: ['24小时在线', '独立公网IP', '稳定可靠', '易扩容'],
    cautions: ['需持续付费', '需基础 Linux 知识'],
    tags: ['生产环境', '团队项目', '24小时在线'],
    footerItems: [
      { label: '阿里云', href: 'https://www.aliyun.com' },
      { label: '腾讯云', href: 'https://cloud.tencent.com' },
      { label: '华为云', href: 'https://www.huaweicloud.com' },
      { label: 'Vultr', href: 'https://www.vultr.com' },
    ],
    highlights: ['阿里云 / 腾讯云 / 华为云', 'Vultr / DigitalOcean / Hetzner', '适合 Docker、源码、反向代理组合'],
    specs: [
      { label: 'CPU', value: '2 核' },
      { label: '内存', value: '4 GB' },
      { label: '硬盘', value: '50 GB SSD' },
      { label: '系统', value: 'Ubuntu 22.04' },
    ],
    note: '基础指南里把 VPS 视为云端主机的一种。',
    ctaLabel: '查看平台',
    ctaHash: '#/infrastructure?tab=cloud',
  },
  {
    title: '一键托管平台',
    subtitle: '最省心，最适合快速跑起来',
    icon: Rocket,
    accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
    summary: '平台帮你处理底层服务器、容器和证书，你只需要连仓库、填环境变量、点击部署。',
    costLabel: '有免费额度，付费按量',
    bestFor: '新手试跑、MVP、希望减少运维负担的项目',
    pros: ['几分钟完成部署', '默认带 HTTPS', '零运维体验'],
    cautions: ['灵活性较低', '长期费用可能更高'],
    tags: ['新手试跑', 'MVP', '零运维'],
    footerItems: [
      { label: 'Zeabur', href: 'https://zeabur.com' },
      { label: 'Railway', href: 'https://railway.com' },
      { label: 'Sealos', href: 'https://sealos.run' },
      { label: 'Render', href: 'https://render.com' },
    ],
    highlights: ['Zeabur / Railway / Sealos / Render', '界面化部署，对命令行依赖更少', '适合先验证业务，再考虑迁移'],
    note: '如果你现在最重要的是“尽快上线一个能访问的版本”，这一类通常最省心。',
    ctaLabel: '查看平台',
    ctaHash: '#/infrastructure?tab=hosted',
  },
  {
    title: '本地设备',
    subtitle: '开发测试最灵活，但不适合直接长期对外服务',
    icon: Laptop,
    accent: 'from-violet-500/20 to-violet-500/5 text-violet-300',
    summary: '你手边的 Mac、Windows、Linux 电脑，或者 NAS、旧主机、Mac mini 都可以直接拿来跑。',
    costLabel: '零成本（利用现有设备）',
    bestFor: '本地开发、功能体验、家庭内网场景、低成本测试',
    pros: ['体验和开发成本最低', '已有设备可直接利用', '适合内网场景或测试'],
    cautions: ['关机即停服', '外网需内网穿透'],
    tags: ['本地开发', '功能体验', '低成本测试'],
    footerItems: [{ label: 'Mac' }, { label: 'Windows' }, { label: 'Linux' }, { label: 'NAS' }],
    highlights: ['个人电脑 / Mac mini / Intel NUC / NAS', '适合本地 Docker 或源码运行', '公网访问通常需要 Cloudflare Tunnel 或 frp'],
    note: '关机即停服，外网需配置内网穿透',
  },
];

const deployOptions: DeployOption[] = [
  {
    title: 'Docker 部署',
    subtitle: '默认首选，适合绝大多数部署场景',
    icon: Box,
    accent: 'from-[#4f7cff]/20 to-[#4f7cff]/5 text-[#7ea2ff]',
    summary: '把应用和依赖都装进一个可迁移的运行盒子里，部署稳定、升级直观、迁移成本也低。',
    bestFor: '正式上线、长期维护、希望部署和升级都标准化的项目',
    strengths: ['环境一致，不污染系统', '一行命令启动，适合复制部署', '升级时只需拉新镜像重建容器'],
    tradeoffs: ['需要先装 Docker', '第一次接触容器概念时有少量学习成本'],
    highlights: ['推荐搭配云服务器', '1Panel / Portainer / 宝塔都能辅助管理', '迁移到新机器时最省心'],
    command: `# 安装 Docker\ncurl -fsSL https://get.docker.com | sh\n\n# 启动 OpenClaw\ndocker run -d --name openclaw \\\n  -p 8080:8080 openclaw/core:latest`,
    note: '可搭配 1Panel、宝塔、Portainer 或 NAS 自带面板做可视化管理。',
    tutorialHash: '#/detail/claude-3-5-launch?from=%23/guide/basic',
  },
  {
    title: '一键部署脚本',
    subtitle: '命令最少，上手速度最快',
    icon: Zap,
    accent: 'from-amber-500/20 to-amber-500/5 text-amber-300',
    summary: '官方脚本把安装动作串起来，适合想尽快跑通第一版，不打算自己拆每个安装细节的人。',
    bestFor: '初次试跑、快速安装验证、想先启动成功再慢慢理解细节',
    strengths: ['命令最少，部署流程快', '适合初次上手', '比源码部署更省心'],
    tradeoffs: ['可控性低于 Docker / 源码', '遇到定制需求时不如源码直接'],
    highlights: ['适合单机快速拉起', '适合先跑通后再决定是否迁移', '对命令行经验要求相对低'],
    command: `curl -fsSL https://install.openclaw.com | bash`,
    note: '如果你的首要目标是“先有一个可运行版本”，这一类方式通常最直接。',
    tutorialHash: '#/detail/openai-gpt-5-4-release?from=%23/guide/basic',
  },
  {
    title: '源码部署',
    subtitle: '灵活度最高，适合开发与深度改造',
    icon: TerminalSquare,
    accent: 'from-slate-400/20 to-slate-400/5 text-slate-300',
    summary: '直接拉代码、安装依赖、手动运行，所有运行细节都在你手里，也最适合做二次开发。',
    bestFor: '开发者、二次定制、调试问题、接入自定义工作流',
    strengths: ['完全掌控每一行代码', '适合二次开发和调试', '灵活度最高'],
    tradeoffs: ['需要 Node.js / pnpm 环境', '升级和故障排查更依赖工程能力'],
    highlights: ['适合本地开发和调试', '最容易接入自定义逻辑', '适合团队协作开发'],
    command: `# 克隆代码库\ngit clone https://github.com/openclaw/core.git\n\n# 安装依赖并启动\ncd core && pnpm install\npnpm run dev`,
    note: '如果你计划长期改代码，这一类方式会比脚本或纯面板部署更顺手。',
    tutorialHash: '#/detail/anthropic-claude-enterprise?from=%23/guide/basic',
  },
];

function SectionHeader({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-[#1ed661]" />
        <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h2>
      </div>
      <p className="max-w-3xl border-l border-white/10 pl-4 text-sm leading-7 text-gray-400 md:text-base">{summary}</p>
    </div>
  );
}

function EnvironmentShowcase({ item, index }: { item: EnvironmentOption; index: number }) {
  const Icon = item.icon;
  const specText = item.specs?.map((spec) => spec.value).join(' · ');

  return (
    <article className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1ed661]/20 lg:grid-cols-[220px_minmax(0,1fr)] lg:p-8">
      <div className="space-y-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Option 0{index + 1}</div>
          <h3 className="mt-2 text-2xl font-black text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-gray-400">{item.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f141b] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-500">最适合</div>
          <div className="mt-2 text-sm font-medium leading-7 text-white">{item.bestFor}</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm leading-8 text-gray-300 md:text-base">{item.summary}</p>
          <div className="mt-3 text-lg font-semibold text-[#4370f5]">{item.costLabel}</div>
        </div>

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="space-y-3 border-y border-white/8 py-4">
          <div className="flex flex-wrap items-start gap-2 text-sm leading-7 text-gray-300">
            <span className="font-semibold text-emerald-300">✓</span>
            <span>{item.pros.join(' · ')}</span>
          </div>
          <div className="flex flex-wrap items-start gap-2 text-sm leading-7 text-gray-300">
            <span className="font-semibold text-amber-300">⚠</span>
            <span>{item.cautions.join(' · ')}</span>
          </div>
        </div>

        {specText ? <div className="text-sm text-gray-400">推荐配置：{specText}</div> : null}

        <div className="flex flex-wrap items-center gap-3">
          {item.note ? (
            <p className="text-sm leading-7 text-gray-400">
              <span className="mr-2 text-amber-300">⚠</span>
              {item.note}
            </p>
          ) : null}
          {item.ctaLabel && item.ctaHash ? (
            <button
              type="button"
              onClick={() => {
                window.location.hash = item.ctaHash!;
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#1ed661]/25 bg-[#1ed661]/10 px-4 py-2 text-sm font-semibold text-[#9af0b6] transition-colors hover:bg-[#1ed661]/16"
            >
              {item.ctaLabel}
            </button>
          ) : null}
        </div>

        {item.footerItems?.length ? (
          <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
            {item.footerItems.map((entry) => (
              entry.href ? (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                >
                  {entry.label}
                </a>
              ) : (
                <span key={entry.label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                  {entry.label}
                </span>
              )
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DeployShowcase({ item, index }: { item: DeployOption; index: number }) {
  const Icon = item.icon;
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    if (!item.command) return;
    try {
      await navigator.clipboard.writeText(item.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:p-8">
      <div className="space-y-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Mode 0{index + 1}</div>
          <h3 className="mt-2 text-2xl font-black text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-gray-400">{item.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f141b] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-500">最适合</div>
          <div className="mt-2 text-sm font-medium leading-7 text-white">{item.bestFor}</div>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-sm leading-8 text-gray-300 md:text-base">{item.summary}</p>

        {item.highlights?.length ? (
          <div className="flex flex-wrap gap-2">
            {item.highlights.map((highlight) => (
              <span key={highlight} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300">
                {highlight}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <BadgeCheck className="h-4 w-4" />
              优势
            </div>
            <ul className="space-y-2 text-sm leading-7 text-gray-300">
              {item.strengths.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>

          {item.tradeoffs?.length ? (
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <ShieldCheck className="h-4 w-4" />
                需要注意
              </div>
              <ul className="space-y-2 text-sm leading-7 text-gray-300">
                {item.tradeoffs.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {item.command ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f141b] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">示例命令</div>
              <button
                type="button"
                onClick={copyCommand}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
              >
                {copied ? '已复制' : '复制命令'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-gray-300">
              {item.command}
            </pre>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {item.note ? <p className="text-sm leading-7 text-gray-400">{item.note}</p> : null}
          {item.tutorialHash ? (
            <button
              type="button"
              onClick={() => {
                window.location.hash = item.tutorialHash!;
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#1ed661]/25 bg-[#1ed661]/10 px-4 py-2 text-sm font-semibold text-[#9af0b6] transition-colors hover:bg-[#1ed661]/16"
            >
              查看教程
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function BasicGuidePage() {
  const introStats = useMemo(
    () => [
      { label: '先决定', value: '运行环境' },
      { label: '再选择', value: '部署方式' },
    ],
    []
  );

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(30,214,97,0.16),transparent_58%)]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1ed661]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-14 md:pt-20">
        <header className="mx-auto mb-14 flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1ed661]/20 bg-[#1ed661]/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#86efac]">
            <BookOpen className="h-4 w-4" />
            运行环境、部署方式与上线选择速览
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-6xl">
            OpenClaw 基础指南
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9">
            在真正部署之前，先把运行环境和部署方式一次看清。读完这一页，你基本就知道自己该选哪条路。
          </p>

          <div className="mt-8 grid w-full gap-3 md:grid-cols-2">
            {introStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-500">{item.label}</div>
                <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </header>

        <main className="space-y-24">
          <section id="env" className="scroll-mt-28">
            <SectionHeader title="运行环境" summary="先决定 OpenClaw 跑在哪里。运行环境决定了成本、稳定性、能不能公网访问，以及后面部署和维护的难度。" />
            <div className="space-y-6">
              {environmentOptions.map((item, index) => (
                <EnvironmentShowcase key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section id="deploy" className="scroll-mt-28">
            <SectionHeader title="部署方式" summary="场地定了以后，再决定用什么方式把应用装上去。对于大多数人来说，Docker 仍然是最稳妥的默认选择。" />
            <div className="space-y-6">
              {deployOptions.map((item, index) => (
                <DeployShowcase key={item.title} item={item} index={index} />
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0f141b] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Server className="h-5 w-5 text-[#7ea2ff]" />
                <h3 className="text-lg font-bold text-white">怎么选更省事</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold text-white">想稳妥上线</div>
                  <p className="mt-2 text-sm leading-7 text-gray-400">优先选 Docker + 云服务器，这是最均衡的默认解法。</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold text-white">想最快跑通</div>
                  <p className="mt-2 text-sm leading-7 text-gray-400">优先选一键脚本或托管平台，先验证可用性，再考虑细化部署。</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold text-white">想深度改代码</div>
                  <p className="mt-2 text-sm leading-7 text-gray-400">直接源码部署，开发、调试和二次定制都会更顺手。</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}
