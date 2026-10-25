export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1866C1]/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#1866C1] text-white hover:bg-[#145199] border border-transparent shadow-sm shadow-[#1866C1]/20',
    secondary: 'bg-[#e7f5ff] text-[#0f3c67] hover:bg-[#d7ecff] border border-transparent',
    outline: 'bg-transparent text-[#1866C1] hover:bg-[#eff6ff] border border-[#dbeafe] dark:border-[#2f3c59] dark:text-[#cbd5e1] dark:hover:bg-[#1f2937]',
    ghost: 'bg-transparent text-[#1a1a1a] hover:bg-[#f5f7fc] dark:text-[#e5e5e5] dark:hover:bg-[#1f2937]',
    destructive: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] border border-transparent shadow-sm shadow-red-500/10',
  };

  const sizeStyles = {
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
