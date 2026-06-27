import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[var(--gold)] text-black hover:opacity-90',
  ghost: 'bg-transparent text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface)]',
  danger: 'bg-transparent text-[var(--red)] hover:bg-[var(--red)]/10',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-[var(--r)] font-medium transition-all cursor-pointer border-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
