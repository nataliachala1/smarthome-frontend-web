import React, { useEffect, useState } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  label?: string;
  error?: string;
  validate?: (value: string) => string;
  validateOn?: 'blur' | 'change';
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
  validateOn = 'blur', // 'blur' | 'change'
  onChange,
  value,
  defaultValue,
  ...props
}: InputProps) => {
  const [valueState, setValueState] = useState(value ?? defaultValue ?? '');
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => {
    if (value !== undefined) setValueState(value);
  }, [value]);

  const runValidation = (val) => {
    if (required && (!val || String(val).trim() === '')) return 'Este campo es obligatorio';
    if (minLength && String(val).length < minLength)
      return `Debe tener al menos ${minLength} caracteres`;
    if (maxLength && String(val).length > maxLength)
      return `Debe tener como máximo ${maxLength} caracteres`;
    if (pattern) {
      try {
        const re = new RegExp(String(pattern));
        if (!re.test(String(val))) return 'Formato inválido';
      } catch (e) {
        // invalid pattern - ignore here
      }
    }
    if (validate && typeof validate === 'function') {
      const custom = validate(val);
      if (custom) return custom;
    }
    return '';
  };

  const handleBlur = (e) => {
    setTouched(true);
    if (actualValidateOn === 'blur' || actualValidateOn === 'change') {
      setInternalError(runValidationWrapped(valueState));
    }
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (value === undefined) setValueState(val);
    if (onChange) onChange(e);
    if (actualValidateOn === 'change') setInternalError(runValidationWrapped(val));
  };

  const displayedError = externalError || (touched ? internalError : '');
  const errorId = props.id ? `${props.id}-error` : undefined;

  const isPassword = props.type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  // for password fields, validate while typing and enforce stricter defaults
  const actualValidateOn = isPassword ? 'change' : validateOn;

  // Apply sensible defaults for password fields when not explicitly provided
  const effectiveMinLength = isPassword && minLength === undefined ? 8 : minLength;
  const passwordPattern = /(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;

  const effectiveValidate = (val) => {
    if (isPassword) {
      const pw = String(val || '');
      if (effectiveMinLength && pw.length < effectiveMinLength)
        return `La contraseña debe tener al menos ${effectiveMinLength} caracteres`;
      if (!/\d/.test(pw)) return 'La contraseña debe incluir al menos un número';
      if (!/[^A-Za-z0-9]/.test(pw)) return 'La contraseña debe incluir al menos un carácter especial';
    }
    if (validate && typeof validate === 'function') return validate(val);
    return '';
  };

  // If it's a password field and the user didn't provide a validate prop,
  // use effectiveValidate inside runValidation by wrapping.
  const runValidationWrapped = (val) => {
    if (isPassword && !validate) return effectiveValidate(val);
    return runValidation(val);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-slate-700 dark:text-slate-200 mb-2">
          {label} {required && <span className="text-[#dc2626]">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={props.id}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          // enforce HTML constraints for password fields
          required={isPassword ? (required === undefined ? true : required) : required}
          minLength={isPassword ? effectiveMinLength : minLength}
          pattern={isPassword ? passwordPattern.source : pattern}
          value={valueState}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!displayedError}
          aria-describedby={displayedError && errorId}
          className={`w-full px-4 py-3 bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#333333] text-[#1a1a1a] dark:text-[#e5e5e5] placeholder:text-[#8b98aa] dark:placeholder:text-[#7b8693] shadow-sm shadow-slate-900/5 dark:shadow-black/20 focus:outline-none focus:border-[#1866C1] focus:ring-2 focus:ring-[#1866C1]/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#666666] dark:text-[#a3a3a3]"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {displayedError && (
        <p id={errorId} className="mt-1 text-sm text-[#dc2626]">
          {displayedError}
        </p>
      )}
      {isPassword && !displayedError && valueState && (
        <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">Nivel: {(() => {
          const pw = String(valueState);
          let score = 0;
          if (pw.length >= (effectiveMinLength || 8)) score++;
          if (/[A-Z]/.test(pw)) score++;
          if (/\d/.test(pw)) score++;
          if (/[^A-Za-z0-9]/.test(pw)) score++;
          if (score <= 1) return 'Débil';
          if (score === 2) return 'Media';
          return 'Fuerte';
        })()}</p>
      )}
    </div>
  );
};
