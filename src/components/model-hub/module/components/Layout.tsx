import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCompare } from '../hooks/useCompare';
import { models, providers } from '../constants';

const PRIMARY_ROUTES = new Set([
  '/',
  '/ai-models/providers',
  '/ai-models/discover',
  '/ai-models/rankings',
  '/ai-models/compare',
  '/ai-models/ecosystem'
]);

function isTopLevelRoute(pathname: string) {
  return PRIMARY_ROUTES.has(pathname);
}

export function Breadcrumbs() {
  const location = useLocation();

  if (isTopLevelRoute(location.pathname)) return null;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ name: 'AI模型中心', path: '/' }];

    if (paths.includes('models')) {
      const id = paths[paths.indexOf('models') + 1];
      const model = models.find((item) => item.id === id);
      if (!model) return crumbs;
      const provider = providers.find((item) => item.id === model.provider);
      crumbs.push({ name: '模型广场', path: '/ai-models/providers' });
      if (provider) {
        crumbs.push({ name: provider.name, path: `/ai-models/providers/${provider.id}` });
      }
      crumbs.push({ name: model.name, path: `/ai-models/models/${model.id}` });
      return crumbs;
    }

    if (paths.includes('providers')) {
      const id = paths[paths.indexOf('providers') + 1];
      const provider = providers.find((item) => item.id === id);
      crumbs.push({ name: '厂商生态', path: '/ai-models/ecosystem' });
      if (provider) {
        crumbs.push({ name: provider.name, path: `/ai-models/providers/${provider.id}` });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="mb-6 flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-2">
          {index > 0 ? <span className="text-white/24">/</span> : null}
          <Link
            to={crumb.path}
            className={cn(
              'transition-colors',
              index === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-white/46 hover:text-[#1ed661]'
            )}
          >
            {crumb.name}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function CompareToolbar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (compareList.length === 0 || location.pathname === '/ai-models/compare') return null;

  const selectedModels = compareList.map((id) => models.find((item) => item.id === id)).filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] h-16 border-t border-white/10 bg-[#111923]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/34 md:flex">
            <Layers size={14} className="text-[#1ed661]" />
            对比栏 ({compareList.length}/4)
          </div>
          <div className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto">
            {selectedModels.map((model) => (
              <div
                key={model!.id}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-[#161b22] text-[10px] font-bold text-white/90">
                  {model!.name[0]}
                </div>
                <span className="text-xs font-medium text-white/72">{model!.name}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(model!.id)}
                  className="rounded-full p-1 text-white/34 transition-colors hover:bg-white/8 hover:text-white"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-white/44 transition-colors hover:text-white"
          >
            清空
          </button>
          <button
            type="button"
            onClick={() => navigate(`/ai-models/compare?models=${compareList.join(',')}`)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1ed661] px-5 text-sm font-bold text-black transition-all hover:brightness-110"
          >
            开始对比
            <Layers size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FloatingCompareButton() {
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (compareList.length === 0 || location.pathname === '/ai-models/compare') return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/ai-models/compare?models=${compareList.join(',')}`)}
      className="fixed bottom-24 right-8 z-[60] flex items-center gap-3 rounded-full bg-[#1ed661] px-5 py-4 text-black shadow-[0_0_32px_rgba(30,214,97,0.26)] transition-all hover:scale-[1.02] hover:brightness-110"
    >
      <div className="relative">
        <Layers size={22} />
        <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full border border-black/20 bg-white text-[10px] font-black text-black">
          {compareList.length}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm font-black leading-none">进入对比</span>
        <span className="text-[11px] leading-none text-black/62">查看模型横向差异</span>
      </div>
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <Breadcrumbs />
        {children}
      </main>
      <CompareToolbar />
      <FloatingCompareButton />
    </div>
  );
}
