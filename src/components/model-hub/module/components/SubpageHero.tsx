import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { models, providers } from '../constants';
import { cn } from '../lib/utils';

type SubpageHeroProps = {
  badge?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  accentClassName?: string;
  actions?: ReactNode;
};

export function SubpageHero({
  badge = 'AI模型中心',
  title,
  description: _description,
  icon: Icon,
  accentClassName = 'text-[#1ed661]',
  actions,
}: SubpageHeroProps) {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathname = location.pathname;

    if (pathname === '/ai-models/discover') {
      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: title || badge || '模型发现', path: pathname, current: true },
      ];
    }

    if (pathname === '/ai-models/free-zone') {
      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: title || badge || '免费专区', path: pathname, current: true },
      ];
    }

    if (pathname === '/ai-models/rankings') {
      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: title || badge || '风云榜单', path: pathname, current: true },
      ];
    }

    if (pathname === '/ai-models/compare') {
      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: title || badge || '深度对比', path: pathname, current: true },
      ];
    }

    if (pathname === '/ai-models/ecosystem') {
      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: title || badge || '厂商生态', path: pathname, current: true },
      ];
    }

    if (pathname.startsWith('/ai-models/providers/')) {
      const providerId = pathname.split('/').pop() || '';
      const provider = providers.find((item) => item.id === providerId);

      return [
        { name: '模型广场', path: '/ai-models/providers' },
        { name: '厂商生态', path: '/ai-models/ecosystem' },
        { name: provider?.name || title, path: pathname, current: true },
      ];
    }

    if (pathname.startsWith('/ai-models/models/')) {
      const modelId = pathname.split('/').pop() || '';
      const model = models.find((item) => item.id === modelId);
      const provider = providers.find((item) => item.id === model?.provider);

      return [
        { name: '模型广场', path: '/ai-models/providers' },
        ...(provider ? [{ name: provider.name, path: `/ai-models/providers/${provider.id}` }] : []),
        { name: model?.name || title, path: pathname, current: true },
      ];
    }

    return [
      { name: '模型广场', path: '/ai-models/providers' },
      { name: title || badge, path: pathname, current: true },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/35">
      <div className="flex h-[72px] items-center justify-between gap-4 px-5 md:px-6">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          {Icon ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Icon size={14} className={accentClassName} />
            </div>
          ) : null}
          <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.path}-${crumb.name}`} className="flex min-w-0 items-center gap-2">
                {index > 0 ? <ChevronRight size={14} className="shrink-0 text-zinc-600" /> : null}
                <Link
                  to={crumb.path}
                  className={cn(
                    'truncate transition-colors',
                    crumb.current ? 'font-medium text-white' : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {actions ? (
          <div className="hidden shrink-0 items-center gap-2 overflow-x-auto no-scrollbar md:flex">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
