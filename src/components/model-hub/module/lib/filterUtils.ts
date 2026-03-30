import { Model } from '../types';

export interface FilterState {
  searchQuery: string;
  selectedType: string;
  selectedScenario: string;
  budgetLimit: number;
  contextWindow: number;
  isOpenSource: string; // 'all' | 'open' | 'closed'
  sortBy: string;
}

export const initialFilterState: FilterState = {
  searchQuery: '',
  selectedType: '全部',
  selectedScenario: '全部',
  budgetLimit: 1000,
  contextWindow: 0,
  isOpenSource: 'all',
  sortBy: 'default',
};

export const mapNaturalLanguageToFilters = (query: string): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};
  const q = query.toLowerCase();

  // Scenarios
  if (q.includes('客服')) filters.selectedScenario = '客服对话';
  if (q.includes('代码') || q.includes('编程')) filters.selectedScenario = '代码开发';
  if (q.includes('推理') || q.includes('数学')) filters.selectedScenario = '复杂推理';
  if (q.includes('写作') || q.includes('文案')) filters.selectedScenario = '生成文章';

  // Modality / Type
  if (q.includes('对话') || q.includes('聊天')) filters.selectedType = '对话';
  if (q.includes('多模态')) filters.selectedType = '多模态';
  if (q.includes('生图') || q.includes('图片')) filters.selectedType = '生图';
  if (q.includes('文本')) filters.selectedType = '纯文本';
  if (q.includes('语音') || q.includes('音频')) filters.selectedType = '语音';
  if (q.includes('视频')) filters.selectedType = '视频';

  // Budget
  if (q.includes('便宜') || q.includes('低成本') || q.includes('预算低')) filters.budgetLimit = 50;
  if (q.includes('免费')) filters.budgetLimit = 0;

  // Context Window
  if (q.includes('长文本') || q.includes('上下文长')) filters.contextWindow = 128000;
  if (q.includes('超长')) filters.contextWindow = 200000;

  // Open Source
  if (q.includes('开源')) filters.isOpenSource = 'open';
  if (q.includes('闭源') || q.includes('官方')) filters.isOpenSource = 'closed';

  // Sorting
  if (q.includes('快') || q.includes('响应快')) filters.sortBy = 'speed';
  if (q.includes('强') || q.includes('性能')) filters.sortBy = 'performance';

  return filters;
};

export const filterModels = (models: Model[], filters: FilterState) => {
  return models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
                         m.provider.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         m.tags.some(t => t.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    const matchesType = filters.selectedType === '全部' || 
                       m.modality === filters.selectedType || 
                       (filters.selectedType === '对话' && (m.modality === '纯文本' || m.modality === '多模态')) ||
                       (filters.selectedType === '生图' && m.modality === '图像生成');
    
    const matchesScenario = filters.selectedScenario === '全部' || m.scenarios.includes(filters.selectedScenario) || m.tags.includes(filters.selectedScenario);
    const matchesBudget = m.pricing.output <= filters.budgetLimit;
    const matchesContext = m.contextWindow >= filters.contextWindow;
    const matchesOpenSource = filters.isOpenSource === 'all' || 
                             (filters.isOpenSource === 'open' && m.isOpenSource) ||
                             (filters.isOpenSource === 'closed' && !m.isOpenSource);

    return matchesSearch && matchesType && matchesScenario && matchesBudget && matchesContext && matchesOpenSource;
  }).sort((a, b) => {
    if (filters.sortBy === 'speed') return a.speed.ttft - b.speed.ttft;
    if (filters.sortBy === 'performance') return b.eloScore - a.eloScore;
    if (filters.sortBy === 'price_low') return a.pricing.output - b.pricing.output;
    return 0;
  });
};
