export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-[#f5f5f5] text-[#1a1a1a] dark:bg-[#262626] dark:text-[#e5e5e5]',
    success: 'bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#86efac]',
    warning: 'bg-[#fef3c7] text-[#92400e] dark:bg-[#78350f] dark:text-[#fde68a]',
    error: 'bg-[#fee2e2] text-[#991b1b] dark:bg-[#7f1d1d] dark:text-[#fca5a5]',
    info: 'bg-[#dbeafe] text-[#1e40af] dark:bg-[#1e3a8a] dark:text-[#93c5fd]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
