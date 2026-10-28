import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    error: 'bg-destructive-soft text-destructive',
    info: 'bg-info-soft text-info',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
