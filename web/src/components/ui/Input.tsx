import React, { useEffect, useId, useState } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  label?: string;
  error?: string;
  validate?: (value: string) => string;
  validateOn?: 'blur' | 'change';
  leadingIcon?: React.ReactNode;
  passwordToggle?: 'text' | 'icon';
  showPasswordStrength?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
}

export const Input = ({
  label,
  error: externalError,
  className = '',
  required,
  minLength,
  maxLength,
  pattern,
  validate,
  validateOn = 'blur',
  leadingIcon,
  passwordToggle = 'text',
  showPasswordStrength = false,
  onChange,
  value,
  defaultValue,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const [valueState, setValueState] = useState(value ?? defaultValue ?? '');
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => {
    if (value !== undefined) setValueState(value);
  }, [value]);

  const runValidation = (rawValue: string) => {
    if (required && (!rawValue || rawValue.trim() === '')) return 'Este campo es obligatorio';
    if (minLength && rawValue.length < minLength) return `Debe tener al menos ${minLength} caracteres`;
    if (maxLength && rawValue.length > maxLength) return `Debe tener como máximo ${maxLength} caracteres`;
    if (pattern) {
      try {
        if (!new RegExp(String(pattern)).test(rawValue)) return 'Formato inválido';
      } catch {
        // An invalid pattern should not block entry.
      }
    }
    return validate?.(rawValue) ?? '';
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    setInternalError(runValidation(valueState));
    props.onBlur?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (value === undefined) setValueState(nextValue);
    onChange?.(event);
    if (validateOn === 'change' || touched) setInternalError(runValidation(nextValue));
  };

  const displayedError = externalError || (touched ? internalError : '');
  const errorId = displayedError ? `${inputId}-error` : undefined;
  const describedBy = [props['aria-describedby'], errorId].filter(Boolean).join(' ') || undefined;
  const isPassword = props.type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = () => {
    const password = String(valueState);
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 'Débil';
    if (score < 4) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-[#7180a0] dark:text-[#a3b2cc]"
          >
            {leadingIcon}
          </span>
        )}
        <input
          {...props}
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          value={valueState}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(displayedError)}
          aria-describedby={describedBy}
          className={`w-full border border-input bg-input-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,background-color,color] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none dark:shadow-black/20 ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className={`absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none ${passwordToggle === 'icon' ? 'sh-input-password-toggle' : ''}`}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
          >
            {passwordToggle === 'icon' ? (
              <>
                <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.8 4.6 9.5 6-.3.6-1.2 1.9-2.7 3.3M6.2 6.2C3.9 7.7 2.7 10.2 2.5 11c.7 1.4 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </>
            ) : (
              showPassword ? 'Ocultar' : 'Mostrar'
            )}
          </button>
        )}
      </div>
      {displayedError && (
        <p id={errorId} aria-live="polite" className="mt-1 text-sm text-destructive">
          {displayedError}
        </p>
      )}
      {isPassword && showPasswordStrength && !displayedError && valueState && (
        <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">
          Nivel: {passwordStrength()}
        </p>
      )}
    </div>
  );
};
