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
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm shadow-slate-900/5 dark:shadow-black/20 ${
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
  return <h3 className={className}>{children}</h3>;
};

export const CardContent = ({ children, className = '' }: CardPartProps) => {
  return <div className={className}>{children}</div>;
};
