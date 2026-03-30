import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Copy, Check, Zap, Gauge, ShieldCheck, Terminal, BookOpen, Layers, MessageSquare, AlertCircle, ChevronRight, Info, Calculator, TrendingDown, Sparkles, XCircle, CheckCircle2, Globe } from 'lucide-react';
import { models, providers, promptTemplates, scenarios } from '../constants';
import { cn, formatPrice, formatNumber } from '../lib/utils';
import { useCompare } from '../hooks/useCompare';

export const ModelDetail = () => {
  const { id } = useParams();
  const { compareList, addToCompare } = useCompare();
  const model = models.find(m => m.id === id);
  const provider = providers.find(p => p.id === model?.provider);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('python');
  
  // Calculator state
  const [calcInput, setCalcInput] = useState(1000);
  const [calcOutput, setCalcOutput] = useState(2000);
  const [calcRequests, setCalcRequests] = useState(100);

  if (!model || !provider) return <div className="p-20 text-center text-zinc-500">模型不存在</div>;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cost = useMemo(() => {
    const inputCost = (calcInput / 1000000) * model.pricing.input * calcRequests;
    const outputCost = (calcOutput / 1000000) * model.pricing.output * calcRequests;
    return inputCost + outputCost;
  }, [calcInput, calcOutput, calcRequests, model]);

  const cheaperAlternatives = useMemo(() => {
    return models
      .filter(m => m.id !== model.id && m.modality === model.modality && m.pricing.output < model.pricing.output)
      .sort((a, b) => a.pricing.output - b.pricing.output)
      .slice(0, 2);
  }, [model]);

  const codeExamples = {
    curl: `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "${model.id}",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7
  }'`,
    python: `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="YOUR_API_KEY",\n    base_url="https://api.openai.com/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="${model.id}",\n    messages=[{"role": "user", "content": "Hello"}],\n    temperature=0.7\n)\nprint(response.choices[0].message.content)`,
    node: `import OpenAI from 'openai';\n\nconst openai = new OpenAI({\n  apiKey: 'YOUR_API_KEY',\n  baseURL: 'https://api.openai.com/v1',\n});\n\nconst response = await openai.chat.completions.create({\n  model: '${model.id}',\n  messages: [{ role: 'user', content: 'Hello' }],\n});\nconsole.log(response.choices[0].message.content);`,
  };

  const modelScenarios = scenarios.filter(s => s.modelIds.includes(model.id));

  return (
    <div className="modelhub-page py-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-6 mb-12">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 border border-white/5 shadow-2xl shadow-[#1ed661]/5">
              {model.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold text-white tracking-tighter truncate">{model.name}</h1>
                <div className="flex items-center gap-3">
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:border-white/20 transition-all">
                    访问官网 <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => addToCompare(model.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                      compareList.includes(model.id) 
                        ? "bg-[#1ed661]/10 border-[#1ed661]/30 text-[#1ed661]" 
                        : "bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:border-white/20"
                    )}
                  >
                    <Layers size={16} />
                    {compareList.includes(model.id) ? '已加入对比' : '加入对比'}
                  </button>
                </div>
              </div>
              <div className="text-zinc-500 mb-6 flex items-center gap-2">
                <Link to={`/ai-models/providers/${provider.id}`} className="hover:text-[#1ed661] transition-colors">{provider.name}</Link>
                <span className="opacity-20">/</span>
                <span>{model.releaseDate} 发布</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-[#1ed661]/10 text-[#1ed661] rounded font-bold uppercase tracking-tighter border border-[#1ed661]/20">{model.modality}</span>
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded font-bold uppercase tracking-tighter border border-purple-500/20">{model.isOpenSource ? '开源' : '闭源 API'}</span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-bold uppercase tracking-tighter border border-white/5">{formatNumber(model.contextWindow)} 上下文</span>
                {model.openaiCompatible && <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded font-bold uppercase tracking-tighter border border-green-500/20">OpenAI 兼容</span>}
              </div>
            </div>
          </div>

          {/* Suitability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-green-400 flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} /> 适合场景
              </h3>
              <ul className="space-y-3">
                {model.suitableFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="w-1 h-1 rounded-full bg-green-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-4">
                <XCircle size={18} /> 不建议场景
              </h3>
              <ul className="space-y-3">
                {model.unsuitableFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="w-1 h-1 rounded-full bg-red-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: '首字延迟', value: `~${model.speed.ttft}ms`, sub: model.dataSource.name === 'official' ? '官方数据' : '第三方测评', icon: Zap, color: 'text-[#1ed661]', dot: 'bg-[#1ed661]' },
              { label: '生成速度', value: `${model.speed.tps} TPS`, sub: model.dataSource.name === 'official' ? '官方数据' : '平台实测', icon: Gauge, color: 'text-green-400', dot: 'bg-green-400' },
              { label: '并发稳定性', value: '⭐⭐⭐⭐', sub: '社区反馈', icon: ShieldCheck, color: 'text-yellow-400', dot: 'bg-yellow-400' },
              { label: 'API 兼容', value: model.openaiCompatible ? '✅ 兼容' : '❌ 不兼容', sub: 'OpenAI 格式', icon: Terminal, color: 'text-zinc-200', dot: 'bg-zinc-200' },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <stat.icon size={14} className="text-zinc-600" /> {stat.label}
                </div>
                <div className={cn("text-2xl font-bold font-mono tabular-nums mb-1", stat.color)}>{stat.value}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                  <span className={cn("w-1 h-1 rounded-full", stat.dot)} /> {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Calculator */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 mb-8">
              <Calculator size={24} className="text-[#1ed661]" /> 成本估算与对比
            </h2>
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">单次请求输入 Token</label>
                      <span className="text-xs font-mono text-white">{calcInput}</span>
                    </div>
                    <input 
                      type="range" min="100" max="100000" step="100" value={calcInput}
                      onChange={(e) => setCalcInput(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1ed661]"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">单次请求输出 Token</label>
                      <span className="text-xs font-mono text-white">{calcOutput}</span>
                    </div>
                    <input 
                      type="range" min="100" max="10000" step="100" value={calcOutput}
                      onChange={(e) => setCalcOutput(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1ed661]"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">预估请求次数</label>
                      <span className="text-xs font-mono text-white">{calcRequests}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10000" step="10" value={calcRequests}
                      onChange={(e) => setCalcRequests(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1ed661]"
                    />
                  </div>
                </div>
                <div className="bg-[#1ed661]/5 border border-[#1ed661]/10 rounded-xl p-8 flex flex-col justify-center">
                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">预估总成本</div>
                  <div className="text-4xl font-bold text-white font-mono mb-4">¥{cost.toFixed(4)}</div>
                  
                  {cheaperAlternatives.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown size={12} className="text-green-400" /> 更具性价比的选择
                      </div>
                      {cheaperAlternatives.map(alt => (
                        <div key={alt.id} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{alt.name}</span>
                          <span className="text-xs font-mono text-green-400">- {(((model.pricing.output - alt.pricing.output) / model.pricing.output) * 100).toFixed(0)}% 成本</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* API Example */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <Terminal size={24} className="text-[#1ed661]" /> API 接入示例
              </h2>
              <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-white/10">
                {['curl', 'python', 'node'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === lang ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group">
              <pre className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8 overflow-x-auto text-sm font-mono text-zinc-400 leading-relaxed shadow-2xl">
                <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
              </pre>
              <button 
                onClick={() => handleCopy(codeExamples[activeTab as keyof typeof codeExamples])}
                className="absolute top-6 right-6 p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-zinc-400 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
              >
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Prompt Templates */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 mb-8">
              <BookOpen size={24} className="text-purple-400" /> 高分 Prompt 库
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {promptTemplates.filter(t => t.applicableModels.includes(model.id)).map((template, i) => (
                <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">📌 {template.title}</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">适用场景：{template.scene}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(template.promptContent)}
                      className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-all"
                    >
                      复制 Prompt
                    </button>
                  </div>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-6 text-sm font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {template.promptContent}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 mb-8">
              <Layers size={24} className="text-[#1ed661]" /> 业务场景导购
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x no-scrollbar">
              {modelScenarios.map((scenario, i) => (
                <div key={i} className="w-[320px] shrink-0 bg-zinc-900/30 border border-white/5 rounded-2xl p-8 snap-start hover:bg-zinc-900/50 transition-all">
                  <h3 className="text-lg font-bold text-white mb-4">{scenario.title}</h3>
                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed h-12 line-clamp-3">
                    {scenario.description}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">匹配度</span>
                    <span className="text-sm font-bold font-mono text-[#1ed661]">{scenario.matchScore}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1ed661] shadow-[0_0_10px_rgba(30,214,97,0.45)]" style={{ width: `${scenario.matchScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Price Card */}
            <div className="bg-[#1ed661]/5 border border-[#1ed661]/10 rounded-2xl p-8 shadow-2xl shadow-[#1ed661]/5">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">价格</h3>
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-tighter">输入价格</span>
                  <span className="text-2xl font-bold font-mono text-white">¥{formatPrice(model.pricing.input)}<span className="text-[10px] font-bold text-zinc-600 ml-1 uppercase">/百万</span></span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-tighter">输出价格</span>
                  <span className="text-2xl font-bold font-mono text-white">¥{formatPrice(model.pricing.output)}<span className="text-[10px] font-bold text-zinc-600 ml-1 uppercase">/百万</span></span>
                </div>
              </div>
              {model.pricing.freeTier && (
                <div className="text-[10px] text-green-400 bg-green-500/10 p-4 rounded-xl mb-8 flex items-start gap-3 font-bold leading-relaxed border border-green-500/20">
                  <Zap size={14} className="shrink-0 mt-0.5" />
                  <span>含免费额度：{model.pricing.freeTier}</span>
                </div>
              )}
              <a 
                href={model.purchaseLinks.purchase} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#1ed661] hover:bg-[#33e56f] text-black rounded-xl font-bold text-sm transition-all shadow-xl shadow-[#1ed661]/20 active:scale-[0.98] mb-3"
              >
                <ExternalLink size={16} /> 立即获取 API Key ↗
              </a>
              <a 
                href={model.purchaseLinks.official} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                <Globe size={16} /> 访问官方网站 ↗
              </a>
            </div>

            {/* Params Table */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">基础参数</h3>
              <div className="space-y-4">
                {[
                  { label: '厂商', value: provider.name },
                  { label: '发布日期', value: model.releaseDate },
                  { label: '模态', value: model.modality },
                  { label: '上下文窗口', value: formatNumber(model.contextWindow) },
                  { label: '最大输出', value: formatNumber(model.maxOutput) },
                  { label: '开源状态', value: model.isOpenSource ? '开源' : '闭源 API' },
                  { label: '训练截止', value: '2024-04' },
                  { label: 'OpenAI 兼容', value: model.openaiCompatible ? '✅ 是' : '❌ 否' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-zinc-300 text-sm font-bold text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Models */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">相似模型</h3>
              <div className="space-y-6">
                {models.filter(m => m.id !== model.id && m.modality === model.modality).slice(0, 3).map(m => (
                  <Link key={m.id} to={`/ai-models/models/${m.id}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-bold group-hover:bg-zinc-700 transition-all border border-white/5">
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-zinc-300 truncate group-hover:text-[#1ed661] transition-colors">{m.name}</div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest truncate">{m.provider} · ¥{formatPrice(m.pricing.input)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Data Correction */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle size={18} className="text-zinc-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-zinc-400 mb-2">发现数据有误？</div>
                  <button className="text-[10px] text-[#1ed661] hover:text-[#1ed661] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                    提交反馈 <MessageSquare size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
