import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full font-medium transition-[transform,color,background-color,border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:transform-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'border border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover',
    secondary: 'border border-transparent bg-primary-soft text-primary hover:bg-primary-soft-hover',
    outline: 'border border-border bg-transparent text-primary hover:bg-primary-soft dark:text-sky-200',
    ghost: 'border border-transparent bg-transparent text-foreground hover:bg-muted',
    destructive: 'border border-transparent bg-destructive text-destructive-foreground shadow-sm shadow-destructive/10 hover:bg-destructive-hover',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
