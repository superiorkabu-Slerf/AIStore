import { cn } from '../lib/utils';

type LogoAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type LogoAvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  size?: LogoAvatarSize;
  className?: string;
  imageClassName?: string;
};

const sizeClasses: Record<LogoAvatarSize, string> = {
  sm: 'w-8 h-8 rounded-lg p-1.5',
  md: 'w-10 h-10 rounded-xl p-2',
  lg: 'w-12 h-12 rounded-2xl p-2.5',
  xl: 'w-16 h-16 rounded-2xl p-3.5',
};

export function LogoAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  imageClassName,
}: LogoAvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 border border-white/10 bg-zinc-900/90 text-sm font-bold text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.18)]',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full object-contain', imageClassName)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
