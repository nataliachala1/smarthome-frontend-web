export const Card = ({ children, className = '', noPadding = false }) => {
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

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};
