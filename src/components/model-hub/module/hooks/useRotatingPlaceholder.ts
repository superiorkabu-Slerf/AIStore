import { useState, useEffect } from 'react';

export const useRotatingPlaceholder = () => {
  const placeholders = [
    "找适合客服、预算低、响应快的模型",
    "找适合代码生成、上下文长的模型",
    "找支持图像理解的便宜模型"
  ];
  
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return placeholders[index];
};
