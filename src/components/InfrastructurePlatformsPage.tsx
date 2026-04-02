import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Cloud, Layers3, List, Rocket, LayoutGrid } from 'lucide-react';

type PlatformEntry = {
  name: string;
  logo: string;
  logoImage?: string;
  logoText: string;
  logoClass: string;
  tagline: string;
  bestFor: string;
  regions: string;
  pricing: string;
  lowPrice: string;
  lowPriceNote: string;
  starterConfig: string;
  starterPrice: string;
  strengths: string;
  url: string;
};

type CloudVendorEntry = PlatformEntry & {
  featured?: boolean;
  sceneTags: string[];
  featureTags: string[];
  difficulty: string;
  note: string;
  regionLabel: string;
};

type StructuredPlatformEntry = PlatformEntry & {
  featured?: boolean;
  sceneTags: string[];
  featureTags: string[];
  difficulty: string;
  note: string;
  regionLabel: string;
};

type SectionViewMode = 'table' | 'cards';

const glossaryEntryLinks = {
  cloud: '#/list?tab=knowledge',
  vps: '#/list?tab=knowledge',
  hosted: '#/list?tab=knowledge',
} as const;

const cloudVendors: CloudVendorEntry[] = [
  {
    name: '阿里云',
    logo: 'A',
    logoImage: '/platform-logos/ali.svg',
    logoText: '阿里云',
    logoClass: 'bg-[#ff6a00]/12 text-[#ff6a00]',
    tagline: '国内生态成熟，产品线完整。',
    bestFor: '国内业务、正式上线、偏企业场景',
    regions: '中国内地 / 香港 / 海外',
    pricing: '中等，活动期友好',
    lowPrice: '轻量应用服务器',
    lowPriceNote: '常见活动价适合入门站点和单实例项目',
    starterConfig: '2核2G / 40G系统盘',
    starterPrice: '参考起步价：约 ¥38/年起',
    strengths: '控制台完善，配套服务多，备案与国内网络链路更顺。',
    featured: true,
    sceneTags: ['国内业务', '正式上线'],
    featureTags: ['备案友好', '生态完整'],
    difficulty: '中低',
    note: '如果你后续还要用数据库、对象存储、CDN，这一类平台衔接最自然。',
    regionLabel: '国内 / 香港 / 海外',
    url: 'https://www.aliyun.com/activity/ecs/clawdbot',
  },
  {
    name: '腾讯云',
    logo: 'T',
    logoImage: '/platform-logos/tengxun.svg',
    logoText: '腾讯云',
    logoClass: 'bg-[#2d7df6]/12 text-[#2d7df6]',
    tagline: '轻量云和入门产品体验好。',
    bestFor: '中小团队、内容站、入门部署',
    regions: '中国内地 / 香港 / 海外',
    pricing: '入门性价比不错',
    lowPrice: '轻量应用服务器',
    lowPriceNote: '适合博客、演示站和 API 小服务',
    starterConfig: '2核2G / 4M带宽',
    starterPrice: '参考起步价：约 ¥99/年起',
    strengths: '轻量应用服务器上手快，适合快速起步。',
    sceneTags: ['入门部署', '内容站'],
    featureTags: ['控制台清晰', '轻量友好'],
    difficulty: '低',
    note: '如果你想尽快买一台能跑服务的国内机器，轻量线很适合作为第一步。',
    regionLabel: '国内 / 香港 / 海外',
    url: 'https://cloud.tencent.com/act/pro/openclaw',
  },
  {
    name: '华为云',
    logo: 'H',
    logoImage: '/platform-logos/huawei.svg',
    logoText: '华为云',
    logoClass: 'bg-[#e11d48]/12 text-[#e11d48]',
    tagline: '偏稳定和企业级能力。',
    bestFor: '政企客户、稳定性优先项目',
    regions: '中国内地 / 海外',
    pricing: '中等',
    lowPrice: 'Flexus 云服务器',
    lowPriceNote: '适合轻量起步和标准 Web 服务',
    starterConfig: '2核2G / 入门盘配比',
    starterPrice: '参考起步价：约 ¥30-50/月起',
    strengths: '安全与基础设施体系完整，适合偏规范化交付。',
    sceneTags: ['政企场景', '稳定优先'],
    featureTags: ['安全体系', '企业能力'],
    difficulty: '中',
    note: '更适合对稳定性、合规性和规范交付要求更高的团队。',
    regionLabel: '国内 / 海外',
    url: 'https://activity.huaweicloud.com/openclaw',
  },
  {
    name: '火山引擎',
    logo: 'V',
    logoImage: '/platform-logos/huoshan.svg',
    logoText: '火山引擎',
    logoClass: 'bg-[#1677ff]/12 text-[#1677ff]',
    tagline: '适合关注弹性和流量增长的业务。',
    bestFor: '增长型产品、内容和 AI 场景',
    regions: '中国内地 / 海外部分节点',
    pricing: '中等',
    lowPrice: 'ECS 入门规格',
    lowPriceNote: '适合初期验证和弹性增长场景',
    starterConfig: '2核2G / 基础云盘',
    starterPrice: '参考起步价：约 ¥40-60/月起',
    strengths: '云资源与字节系能力协同感更强。',
    sceneTags: ['增长业务', 'AI 场景'],
    featureTags: ['弹性扩容', '增长导向'],
    difficulty: '中',
    note: '如果你的业务会快速扩展，且更关注弹性资源调度，这类平台会更顺手。',
    regionLabel: '国内 / 部分海外',
    url: 'https://www.volcengine.com/activity/clawdbot',
  },
  {
    name: '百度智能云',
    logo: 'B',
    logoImage: '/platform-logos/baiducloud.svg',
    logoText: '百度智能云',
    logoClass: 'bg-[#2563eb]/12 text-[#2563eb]',
    tagline: 'AI 能力和云资源结合更紧。',
    bestFor: 'AI 应用、百度生态接入、国内项目',
    regions: '中国内地 / 海外部分节点',
    pricing: '中等',
    lowPrice: '云服务器 BCC',
    lowPriceNote: '适合基础 Web 服务和 AI 配套节点',
    starterConfig: '2核2G / 基础云盘',
    starterPrice: '参考起步价：约 ¥40-60/月起',
    strengths: '如果业务本身会接百度生态能力，这类平台衔接更顺。',
    sceneTags: ['AI 应用', '国内业务'],
    featureTags: ['AI 生态', '资源整合'],
    difficulty: '中',
    note: '更适合对接百度系能力或偏 AI 场景的项目。',
    regionLabel: '国内 / 部分海外',
    url: 'https://cloud.baidu.com/product/BCC/moltbot.html',
  },
  {
    name: '京东云',
    logo: 'J',
    logoImage: '/platform-logos/jingdongyun.svg',
    logoText: '京东云',
    logoClass: 'bg-[#dc2626]/12 text-[#dc2626]',
    tagline: '偏性价比和活动力度。',
    bestFor: '成本敏感项目、轻量业务、开发者活动场景',
    regions: '中国内地 / 香港',
    pricing: '活动价友好',
    lowPrice: '轻量云主机',
    lowPriceNote: '适合入门站点、演示环境和轻量服务',
    starterConfig: '2核2G / 基础系统盘',
    starterPrice: '参考起步价：约 ¥30-50/月起',
    strengths: '活动期价格通常较有吸引力，适合预算敏感型项目。',
    sceneTags: ['成本敏感', '轻量业务'],
    featureTags: ['活动多', '性价比'],
    difficulty: '低',
    note: '如果你比较关注预算，且主要做国内轻量服务，可以优先留意活动价格。',
    regionLabel: '国内 / 香港',
    url: 'https://www.jdcloud.com/cn/pages/moltbot',
  },
  {
    name: '天翼云',
    logo: 'E',
    logoImage: '/platform-logos/tianyiyun.svg',
    logoText: '天翼云',
    logoClass: 'bg-[#0f766e]/12 text-[#0f766e]',
    tagline: '电信网络资源加成明显。',
    bestFor: '网络质量敏感、偏政企、国内服务',
    regions: '中国内地',
    pricing: '中等',
    lowPrice: '云主机入门规格',
    lowPriceNote: '适合标准 Web 服务与企业内部系统',
    starterConfig: '2核2G / 基础云盘',
    starterPrice: '参考起步价：约 ¥40-60/月起',
    strengths: '在网络链路和电信资源侧有一定优势，适合国内稳定型业务。',
    sceneTags: ['网络稳定', '政企场景'],
    featureTags: ['运营商资源', '国内链路'],
    difficulty: '中',
    note: '更适合偏国内稳定交付、对链路质量较敏感的项目。',
    regionLabel: '国内',
    url: 'https://www.ctyun.cn/act/OpenClaw',
  },
];

const vpsVendors: StructuredPlatformEntry[] = [
  {
    name: 'Vultr',
    logo: 'V',
    logoImage: '/platform-logos/vultr-vps.svg',
    logoText: 'Vultr',
    logoClass: 'bg-[#007bfc]/12 text-[#007bfc]',
    tagline: '海外 VPS 老牌，节点覆盖广。',
    bestFor: '海外服务、API 中转、开发测试',
    regions: '美国 / 欧洲 / 亚洲多节点',
    pricing: '按量灵活',
    lowPrice: 'Cloud Compute',
    lowPriceNote: '常作为低门槛海外轻量节点选择',
    starterConfig: '1 vCPU / 1GB RAM / 25GB SSD',
    starterPrice: '参考起步价：$5/月',
    strengths: '买机快，切换地区方便，适合轻量全球化部署。',
    featured: true,
    sceneTags: ['海外部署', 'API 调用'],
    featureTags: ['节点多', '开机快'],
    difficulty: '低',
    note: '如果你主要关注海外节点和快速起机，Vultr 往往是最容易开始的一档。',
    regionLabel: '美国 / 欧洲 / 亚洲',
    url: 'https://www.vultr.com/marketplace/apps/openclaw/#general-information',
  },
  {
    name: 'DigitalOcean',
    logo: 'D',
    logoImage: '/platform-logos/digitalocean-vps.svg',
    logoText: 'DigitalOcean',
    logoClass: 'bg-[#0080ff]/12 text-[#0080ff]',
    tagline: '开发者友好，概念清晰。',
    bestFor: '个人项目、SaaS 原型、开发团队',
    regions: '美国 / 欧洲 / 亚洲',
    pricing: '中等偏清晰',
    lowPrice: 'Basic Droplets',
    lowPriceNote: '很适合开发者从零起一个小服务',
    starterConfig: '1 vCPU / 1GB RAM / 25GB SSD',
    starterPrice: '参考起步价：$6/月',
    strengths: '产品心智简单，文档和社区生态成熟。',
    sceneTags: ['开发团队', 'SaaS 原型'],
    featureTags: ['文档成熟', '开发者友好'],
    difficulty: '低',
    note: '如果你更在意产品体验和文档生态，而不是单纯追求最低价，这类平台很平衡。',
    regionLabel: '美国 / 欧洲 / 亚洲',
    url: 'https://marketplace.digitalocean.com/apps/openclaw',
  },
  {
    name: 'Linode / Akamai',
    logo: 'L',
    logoImage: 'https://www.linode.com/linode/en/images/logo/akamai-logo.svg',
    logoText: 'Linode',
    logoClass: 'bg-[#00a95c]/12 text-[#00a95c]',
    tagline: '经典 VPS 路线，稳定直给。',
    bestFor: '传统自托管、工程团队',
    regions: '全球多区域',
    pricing: '中等',
    lowPrice: 'Shared CPU',
    lowPriceNote: '适合稳定运行的小型服务和后台任务',
    starterConfig: '1GB RAM / Shared CPU',
    starterPrice: '参考起步价：约 $5/月',
    strengths: '对纯 VPS 使用者来说足够直接，没有太多复杂产品干扰。',
    sceneTags: ['传统自托管', '稳定运行'],
    featureTags: ['路线直接', '工程向'],
    difficulty: '中',
    note: '如果你偏向传统 VPS 使用方式，不需要太多周边产品，它会更干净直接。',
    regionLabel: '全球多区域',
    url: 'https://www.linode.com',
  },
  {
    name: 'Hetzner',
    logo: 'H',
    logoImage: '/platform-logos/hetzner.svg',
    logoText: 'Hetzner',
    logoClass: 'bg-[#d81e05]/12 text-[#d81e05]',
    tagline: '欧洲性价比很高。',
    bestFor: '成本敏感、偏欧洲业务',
    regions: '德国 / 芬兰 / 美国',
    pricing: '高性价比',
    lowPrice: 'CX Shared vCPU',
    lowPriceNote: '同等配置下价格常常更有优势',
    starterConfig: '2 vCPU / 4GB RAM',
    starterPrice: '参考起步价：约 €4-5/月',
    strengths: '如果你更在意成本与机器规格比，这类平台很有吸引力。',
    sceneTags: ['成本敏感', '欧洲业务'],
    featureTags: ['高性价比', '规格友好'],
    difficulty: '中',
    note: '如果你的核心诉求就是“同样预算拿到更高规格”，Hetzner 很值得先看。',
    regionLabel: '德国 / 芬兰 / 美国',
    url: 'https://www.hetzner.com/cloud',
  },
];

const hostedPlatforms: StructuredPlatformEntry[] = [
  {
    name: 'Zeabur',
    logo: 'Z',
    logoImage: '/platform-logos/zeabur.svg',
    logoText: 'Zeabur',
    logoClass: 'bg-[#7c3aed]/12 text-[#7c3aed]',
    tagline: '中文体验友好，部署路径短。',
    bestFor: '国内团队、快速试跑、轻量上线',
    regions: '多区域托管',
    pricing: '轻量起步',
    lowPrice: '最小托管实例',
    lowPriceNote: '适合先部署一个能访问的版本',
    starterConfig: '最小应用实例 / 托管容器',
    starterPrice: '参考起步价：按量，轻量用量可低成本起步',
    strengths: '界面化程度高，对新手很友好。',
    featured: true,
    sceneTags: ['快速试跑', '中文友好'],
    featureTags: ['新手友好', '上手快'],
    difficulty: '低',
    note: '如果你最想解决的是“尽快部署成功”，而不是研究底层细节，这一类最顺手。',
    regionLabel: '多区域托管',
    url: 'https://zeabur.com/zh-CN/templates/VTZ4FX',
  },
  {
    name: 'Railway',
    logo: 'R',
    logoImage: '/platform-logos/railway.svg',
    logoText: 'Railway',
    logoClass: 'bg-[#7c3aed]/12 text-[#a78bfa]',
    tagline: '开发者体验突出。',
    bestFor: '原型验证、团队协作、快速迭代',
    regions: '多区域托管',
    pricing: '按量计费',
    lowPrice: 'Starter 用量级别',
    lowPriceNote: '适合从原型一路跑到早期生产',
    starterConfig: '小型服务实例 / 托管数据库可选',
    starterPrice: '参考起步价：按量，常见小项目约数美元/月起',
    strengths: '从仓库到上线流程顺，适合持续迭代。',
    sceneTags: ['团队协作', '持续迭代'],
    featureTags: ['开发体验好', '仓库直连'],
    difficulty: '低',
    note: '适合从 demo 往早期生产平滑过渡，尤其适合需要频繁发布的小团队。',
    regionLabel: '多区域托管',
    url: 'https://railway.com/deploy/openclaw',
  },
  {
    name: 'Sealos',
    logo: 'S',
    logoImage: '/platform-logos/sealos.svg',
    logoText: 'Sealos',
    logoClass: 'bg-[#0ea5e9]/12 text-[#0ea5e9]',
    tagline: '云原生感更强。',
    bestFor: '容器化项目、希望保留一定弹性控制的团队',
    regions: '国内友好',
    pricing: '按需付费',
    lowPrice: '应用托管基础规格',
    lowPriceNote: '适合容器化服务和弹性工作负载',
    starterConfig: '基础容器实例 / 按需资源',
    starterPrice: '参考起步价：按用量计费',
    strengths: '介于托管平台和更底层云资源之间。',
    sceneTags: ['容器化项目', '弹性工作负载'],
    featureTags: ['云原生', '资源灵活'],
    difficulty: '中',
    note: '如果你希望保留一定云原生能力，又不想自己完全从云厂商底层搭起，这种平台更合适。',
    regionLabel: '国内友好',
    url: 'https://template.bja.sealos.run/deploy?templateName=openclaw',
  },
  {
    name: 'Render',
    logo: 'R',
    logoImage: '/platform-logos/render.svg',
    logoText: 'Render',
    logoClass: 'bg-[#46e3b7]/12 text-[#46e3b7]',
    tagline: '海外托管平台入门经典。',
    bestFor: '海外 demo、文档站、轻量服务',
    regions: '海外为主',
    pricing: '有免费层和付费层',
    lowPrice: 'Starter / Free 级别',
    lowPriceNote: '适合先上线验证，再视流量升级',
    starterConfig: 'Web Service Starter',
    starterPrice: '参考起步价：有免费层，付费常见 $7/月起',
    strengths: '概念直观，适合先部署再逐步优化。',
    sceneTags: ['海外 demo', '轻量服务'],
    featureTags: ['免费层', '概念直观'],
    difficulty: '低',
    note: '如果你面向海外用户，或者只是想低成本快速上线一个海外可访问版本，这类很常见。',
    regionLabel: '海外为主',
    url: 'https://render.com',
  },
];

function CloudCompareTable({
  items,
  activeName,
  onSelect,
}: {
  items: CloudVendorEntry[];
  activeName: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="mb-8 overflow-x-auto rounded-[28px] border border-white/10 bg-white/[0.03]">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">厂商</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">推荐产品</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">配置</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">价格</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">区域</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">适合场景</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">官网</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.name}
              onClick={() => onSelect(item.name)}
              className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 ${
                activeName === item.name ? 'bg-[#4370f5]/10' : 'hover:bg-white/[0.03]'
              }`}
            >
              <td className="px-5 py-4 text-sm font-semibold text-white">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-3 transition-colors hover:text-[#8fb0ff]"
                >
                  {item.logoImage ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#F5F7FA] p-0.5">
                      <img src={item.logoImage} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </span>
                  ) : (
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${item.logoClass}`}>
                      {item.logo}
                    </span>
                  )}
                  <span>{item.name}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </td>
              <td className="px-5 py-4 text-sm text-gray-300">{item.lowPrice}</td>
              <td className="px-5 py-4 text-sm text-gray-300">{item.starterConfig}</td>
              <td className="px-5 py-4 text-sm font-semibold text-[#7ea2ff]">{item.starterPrice.replace('参考起步价：', '')}</td>
              <td className="px-5 py-4 text-sm text-gray-400">{item.regionLabel}</td>
              <td className="px-5 py-4 text-sm text-gray-400">{item.sceneTags.join(' / ')}</td>
              <td className="px-5 py-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                >
                  访问
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CloudVendorCards({ items, activeName }: { items: CloudVendorEntry[]; activeName: string }) {
  const sorted = [...items].sort((a, b) => {
    if (a.name === activeName) return -1;
    if (b.name === activeName) return 1;
    if (a.featured) return -1;
    if (b.featured) return 1;
    return 0;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sorted.map((item) => (
        <article
          key={item.name}
          className={`flex min-h-[420px] flex-col rounded-[30px] border bg-[#181e29] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4d7dff] ${
            item.featured ? 'border-[#4370f5] shadow-[0_20px_60px_rgba(67,112,245,0.12)]' : 'border-[#2a3241]'
          } ${activeName === item.name ? 'ring-1 ring-[#4370f5]/40' : ''}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {item.logoImage ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#F5F7FA] p-1">
                  <img src={item.logoImage} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${item.logoClass}`}>
                  {item.logo}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-black text-white">{item.name}</h3>
              </div>
            </div>
            {item.featured ? (
              <span className="rounded-full border border-[#4370f5]/30 bg-[#4370f5]/12 px-3 py-1 text-xs font-semibold text-[#8fb0ff]">
                推荐
              </span>
            ) : null}
          </div>

          <div className="border-b border-white/8 pb-5">
            <div className="text-sm text-gray-400">推荐产品</div>
            <div className="mt-1 text-xl font-semibold text-white">{item.lowPrice}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-sm text-gray-300">{item.starterConfig}</span>
              <span className="text-lg font-semibold text-[#4370f5]">{item.starterPrice.replace('参考起步价：', '')}</span>
            </div>
          </div>

          <div className="border-b border-white/8 py-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {item.sceneTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#4370f5]/20 bg-[#4370f5]/10 px-3 py-1 text-xs text-[#8fb0ff]">
                  {tag}
                </span>
              ))}
              {item.featureTags.map((tag) => (
                <span key={tag} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-gray-300">区域：{item.regionLabel}</span>
              <span className="text-gray-300">上手难度：{item.difficulty}</span>
            </div>
          </div>

          <div className="flex-1 py-5">
            <p className="text-sm leading-7 text-gray-400">{item.tagline}</p>
            <p className="mt-3 text-sm leading-7 text-gray-500">{item.strengths}</p>
            <p className="mt-3 text-xs leading-6 text-gray-500">{item.note}</p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500">价格感知</div>
              <div className="mt-1 text-sm text-white">{item.pricing}</div>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
            >
              访问平台
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function CompareTable({
  items,
  activeName,
  onSelect,
}: {
  items: StructuredPlatformEntry[];
  activeName: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="mb-8 overflow-x-auto rounded-[28px] border border-white/10 bg-white/[0.03]">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">厂商</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">推荐产品</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">配置</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">价格</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">区域</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">适合场景</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-300">官网</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.name}
              onClick={() => onSelect(item.name)}
              className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 ${
                activeName === item.name ? 'bg-[#4370f5]/10' : 'hover:bg-white/[0.03]'
              }`}
            >
              <td className="px-5 py-4 text-sm font-semibold text-white">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-3 transition-colors hover:text-[#8fb0ff]"
                >
                  {item.logoImage ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#F5F7FA] p-0.5">
                      <img src={item.logoImage} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </span>
                  ) : (
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${item.logoClass}`}>
                      {item.logo}
                    </span>
                  )}
                  <span>{item.name}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </td>
              <td className="px-5 py-4 text-sm text-gray-300">{item.lowPrice}</td>
              <td className="px-5 py-4 text-sm text-gray-300">{item.starterConfig}</td>
              <td className="px-5 py-4 text-sm font-semibold text-[#7ea2ff]">{item.starterPrice.replace('参考起步价：', '')}</td>
              <td className="px-5 py-4 text-sm text-gray-400">{item.regionLabel}</td>
              <td className="px-5 py-4 text-sm text-gray-400">{item.sceneTags.join(' / ')}</td>
              <td className="px-5 py-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                >
                  访问
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StructuredCards({ items, activeName }: { items: StructuredPlatformEntry[]; activeName: string }) {
  const sorted = [...items].sort((a, b) => {
    if (a.name === activeName) return -1;
    if (b.name === activeName) return 1;
    if (a.featured) return -1;
    if (b.featured) return 1;
    return 0;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sorted.map((item) => (
        <article
          key={item.name}
          className={`flex min-h-[420px] flex-col rounded-[30px] border bg-[#181e29] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4d7dff] ${
            item.featured ? 'border-[#4370f5] shadow-[0_20px_60px_rgba(67,112,245,0.12)]' : 'border-[#2a3241]'
          } ${activeName === item.name ? 'ring-1 ring-[#4370f5]/40' : ''}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {item.logoImage ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#F5F7FA] p-1">
                  <img src={item.logoImage} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${item.logoClass}`}>
                  {item.logo}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-black text-white">{item.name}</h3>
              </div>
            </div>
            {item.featured ? (
              <span className="rounded-full border border-[#4370f5]/30 bg-[#4370f5]/12 px-3 py-1 text-xs font-semibold text-[#8fb0ff]">
                推荐
              </span>
            ) : null}
          </div>

          <div className="border-b border-white/8 pb-5">
            <div className="text-sm text-gray-400">推荐产品</div>
            <div className="mt-1 text-xl font-semibold text-white">{item.lowPrice}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-sm text-gray-300">{item.starterConfig}</span>
              <span className="text-lg font-semibold text-[#4370f5]">{item.starterPrice.replace('参考起步价：', '')}</span>
            </div>
          </div>

          <div className="border-b border-white/8 py-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {item.sceneTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#4370f5]/20 bg-[#4370f5]/10 px-3 py-1 text-xs text-[#8fb0ff]">
                  {tag}
                </span>
              ))}
              {item.featureTags.map((tag) => (
                <span key={tag} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-gray-300">区域：{item.regionLabel}</span>
              <span className="text-gray-300">上手难度：{item.difficulty}</span>
            </div>
          </div>

          <div className="flex-1 py-5">
            <p className="text-sm leading-7 text-gray-400">{item.tagline}</p>
            <p className="mt-3 text-sm leading-7 text-gray-500">{item.strengths}</p>
            <p className="mt-3 text-xs leading-6 text-gray-500">{item.note}</p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500">价格感知</div>
              <div className="mt-1 text-sm text-white">{item.pricing}</div>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#4370f5]/30 hover:text-white"
            >
              访问平台
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function InfrastructurePlatformsPage() {
  const [activeCloudName, setActiveCloudName] = useState(cloudVendors[0].name);
  const [activeVpsName, setActiveVpsName] = useState(vpsVendors[0].name);
  const [activeHostedName, setActiveHostedName] = useState(hostedPlatforms[0].name);
  const [cloudViewMode, setCloudViewMode] = useState<SectionViewMode>('table');
  const [vpsViewMode, setVpsViewMode] = useState<SectionViewMode>('table');
  const [hostedViewMode, setHostedViewMode] = useState<SectionViewMode>('table');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const tab = params.get('tab');
    if (!tab) return;

    const idMap: Record<string, string> = {
      cloud: 'cloud',
      vps: 'vps',
      hosted: 'hosted',
    };
    const target = document.getElementById(idMap[tab] || '');
    if (!target) return;
    if (tab === 'cloud') setActiveCloudName(cloudVendors[0].name);
    if (tab === 'vps') setActiveVpsName(vpsVendors[0].name);
    if (tab === 'hosted') setActiveHostedName(hostedPlatforms[0].name);
    window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, []);

  const goToGlossary = (type: keyof typeof glossaryEntryLinks) => {
    window.location.hash = glossaryEntryLinks[type];
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top,rgba(30,214,97,0.16),transparent_58%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-14 md:pt-20">
        <header className="mx-auto mb-14 flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1ed661]/20 bg-[#1ed661]/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#86efac]">
            <Layers3 className="h-4 w-4" />
            云服务器 / VPS / 一键托管平台差异速览
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-6xl">基础设施</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9">
            把常见云服务器厂商、海外 VPS 厂商和一键托管平台放在一起看，更容易理解不同平台之间的定位差异。
          </p>
        </header>

        <main className="space-y-24">
          <section id="cloud" className="scroll-mt-28">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-[#9af0b6]">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black text-white">云服务器厂商</h2>
                    <button
                      type="button"
                      onClick={() => goToGlossary('cloud')}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                      aria-label="查看云服务器名词解释"
                      title="查看名词解释"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-8 text-gray-400 md:text-base">
                  先用速查表快速筛选，再看下方卡片详情。重点先看推荐产品、入门配置和价格，再决定是否深入了解。
                </p>
              </div>
              <ViewModeToggle mode={cloudViewMode} onChange={setCloudViewMode} />
            </div>
            {cloudViewMode === 'table' ? (
              <CloudCompareTable items={cloudVendors} activeName={activeCloudName} onSelect={setActiveCloudName} />
            ) : (
              <CloudVendorCards items={cloudVendors} activeName={activeCloudName} />
            )}
          </section>
          <section id="vps" className="scroll-mt-28">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-[#9af0b6]">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black text-white">VPS 厂商</h2>
                    <button
                      type="button"
                      onClick={() => goToGlossary('vps')}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                      aria-label="查看 VPS 名词解释"
                      title="查看名词解释"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-8 text-gray-400 md:text-base">
                  更适合海外节点、轻量自托管和 API 中转场景。先看价格和配置，再根据区域与定位做选择。
                </p>
              </div>
              <ViewModeToggle mode={vpsViewMode} onChange={setVpsViewMode} />
            </div>

            {vpsViewMode === 'table' ? (
              <CompareTable items={vpsVendors} activeName={activeVpsName} onSelect={setActiveVpsName} />
            ) : (
              <StructuredCards items={vpsVendors} activeName={activeVpsName} />
            )}
          </section>

          <section id="hosted" className="scroll-mt-28">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-[#9af0b6]">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black text-white">一键托管平台</h2>
                    <button
                      type="button"
                      onClick={() => goToGlossary('hosted')}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition-colors hover:border-[#4370f5]/30 hover:text-white"
                      aria-label="查看一键托管平台名词解释"
                      title="查看名词解释"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-8 text-gray-400 md:text-base">
                  更适合不想碰太多底层运维的人。重点先看最低可用形态、价格和是否适合你的迭代节奏。
                </p>
              </div>
              <ViewModeToggle mode={hostedViewMode} onChange={setHostedViewMode} />
            </div>

            {hostedViewMode === 'table' ? (
              <CompareTable items={hostedPlatforms} activeName={activeHostedName} onSelect={setActiveHostedName} />
            ) : (
              <StructuredCards items={hostedPlatforms} activeName={activeHostedName} />
            )}
          </section>
        </main>
      </div>
    </section>
  );
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: SectionViewMode;
  onChange: (next: SectionViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`w-10 h-10 rounded-full border grid place-items-center transition-colors ${
          mode === 'table'
            ? 'bg-[#1ed661]/15 text-[#1ed661] border-[#1ed661]/30'
            : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:border-white/10'
        }`}
        aria-label="表格视图"
        title="表格视图"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('cards')}
        className={`w-10 h-10 rounded-full border grid place-items-center transition-colors ${
          mode === 'cards'
            ? 'bg-[#1ed661]/15 text-[#1ed661] border-[#1ed661]/30'
            : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:border-white/10'
        }`}
        aria-label="卡片视图"
        title="卡片视图"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}
