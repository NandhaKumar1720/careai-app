import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800',
  secondary: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',
  success: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
  warning: 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
  ghost: 'bg-transparent text-slate-900 border-transparent hover:bg-slate-200',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-12 px-4 text-base',
  md: 'h-16 px-6 text-lg',
  lg: 'h-20 px-8 text-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-3 rounded-2xl border-2 font-semibold shadow-lg transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
