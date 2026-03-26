import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/utils';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p';

interface BlurTextProps {
  text: string;
  className?: string;
  as?: HeadingTag;
  delayStep?: number;
}

export function BlurText({
  text,
  className,
  as = 'h1',
  delayStep = 0.1,
}: BlurTextProps) {
  const Component = as;
  const containerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={containerRef as never}
      className={cn('section-heading', className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={{
            filter: 'blur(10px)',
            opacity: 0,
            y: 50,
          }}
          animate={
            isVisible
              ? {
                  filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {
                  filter: 'blur(10px)',
                  opacity: 0,
                  y: 50,
                }
          }
          transition={{
            duration: 0.35,
            delay: index * delayStep,
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.65, 1],
          }}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Component>
  );
}
