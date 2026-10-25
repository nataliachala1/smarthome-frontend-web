import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardPartProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '', noPadding = false }: CardProps) => {
  return (
    <div
      className={`bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#232323] shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-[28px] ${
        !noPadding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardPartProps) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }: CardPartProps) => {
  return <h3 className={`${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = '' }: CardPartProps) => {
  return <div className={className}>{children}</div>;
};
