import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'modelhub_compare_list';

interface CompareContextType {
  compareList: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse compare list', e);
      }
    }
  }, []);

  const addToCompare = useCallback((id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 4) {
        toast.error('最多只能同时对比 4 个模型', {
          description: '请先移除部分模型后再添加。'
        });
        return prev;
      }
      toast.success('已加入对比列表');
      const next = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList(prev => {
      const next = prev.filter(s => s !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
