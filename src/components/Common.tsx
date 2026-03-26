import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative backdrop-blur-xl bg-[#161b22]/70 border border-[#30363d] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#22c55e]/30 hover:-translate-y-1 hover:shadow-2xl group",
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(34, 197, 94, 0.08), transparent)`
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="relative group/tooltip inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#161b22] border border-[#30363d] text-gray-200 text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-50 w-48 shadow-2xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#30363d]" />
      </div>
    </div>
  );
};

export const Badge: React.FC<{ label: string; className?: string }> = ({ label, className }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#22c55e]/20 bg-[#22c55e]/10 text-[#22c55e]", className)}>
    {label}
  </span>
);
