import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { providers, models } from '../constants';

export const ProviderEcosystem = () => {
  return (
    <div className="modelhub-page pb-24 font-sans">
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#10b98115,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 relative text-center">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="text-emerald-500" size={24} />
             </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-white">
            厂商生态
          </h1>
          <p className="text-zinc-500 text-lg mb-12">
            探索全球领先的 AI 研发机构与算力服务商
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => (
            <Link 
              key={provider.id} 
              to={`/ai-models/providers/${provider.id}`}
              className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-8 hover:bg-zinc-900 transition-all group relative"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center p-3 shrink-0 border border-white/5">
                  <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white group-hover:text-[#1ed661] transition-colors">{provider.name}</h2>
                  <p className="text-xs text-zinc-500 line-clamp-3 mt-2 leading-relaxed">{provider.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {models.filter(m => m.provider === provider.id).slice(0, 3).map(m => (
                  <span key={m.id} className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-500 font-medium border border-white/5">{m.name}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                <span className="flex items-center gap-2">探索系列 <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
