import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { models, providers } from '../constants';
import { cn } from '../lib/utils';
import { useCompare } from '../hooks/useCompare';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const placeholder = useRotatingPlaceholder();
  const navigate = useNavigate();
  const { compareList, addToCompare } = useCompare();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Toggle handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.provider.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const hotSearches = ['GPT-4o', 'Claude 3.5', 'DeepSeek-V3', 'Llama 3', '文心一言'];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-bg-root/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[560px] bg-bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-4 h-14 border-b border-white/5">
          <Search className="text-text-tertiary mr-3" size={20} />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary text-lg"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-text-tertiary">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {!query && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">热门搜索</div>
              <div className="flex flex-wrap gap-2 px-3 py-1">
                {hotSearches.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setQuery(s)}
                    className="px-2 py-1 bg-bg-subtle hover:bg-bg-elevated border border-white/5 rounded text-sm text-text-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredModels.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">模型</div>
              {filteredModels.map(m => (
                <div 
                  key={m.id}
                  className="group flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  onClick={() => { navigate(`/ai-models/models/${m.id}`); onClose(); }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bg-subtle rounded flex items-center justify-center text-xs font-bold">{m.name[0]}</div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{m.name}</div>
                      <div className="text-xs text-text-tertiary">{m.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCompare(m.id);
                      }}
                      className={cn(
                        "p-1.5 rounded-lg border transition-all opacity-0 group-hover:opacity-100",
                        compareList.includes(m.id) ? "bg-accent/10 border-accent/20 text-accent opacity-100" : "bg-white/5 border-white/10 text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      <Layers size={14} />
                    </button>
                    <TrendingUp size={14} className="text-text-tertiary" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {query && filteredProviders.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">厂商</div>
              {filteredProviders.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { navigate(`/ai-models/providers/${p.id}`); onClose(); }}
                  className="w-full flex items-center px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.logo} className="w-8 h-8 rounded p-1 bg-white/5" alt={p.name} />
                    <div className="text-sm font-medium text-text-primary">{p.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && filteredModels.length === 0 && filteredProviders.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-text-tertiary text-sm">没有找到匹配的结果</div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-bg-subtle border-t border-white/5 flex items-center justify-between text-[10px] text-text-tertiary font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↑↓</span> 导航</span>
            <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↵</span> 打开</span>
          </div>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>
  );
};
