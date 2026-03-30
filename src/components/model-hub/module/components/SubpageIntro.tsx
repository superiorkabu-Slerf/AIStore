import type { ReactNode } from 'react';

type SubpageIntroProps = {
  title: string;
  description: string;
  highlights?: string[];
  actions?: ReactNode;
};

export function SubpageIntro({
  title,
  description,
  highlights = [],
  actions,
}: SubpageIntroProps) {
  return (
    <section className="mb-8 rounded-3xl border border-white/5 bg-zinc-900/30 px-6 py-6 md:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400 md:text-base">
            {description}
          </p>
          {highlights.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
