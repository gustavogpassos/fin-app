interface BadgeProps {
  variant?: 'red' | 'green' | 'blue' | 'gold' | 'purple'
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<string, string> = {
  red: 'bg-[var(--red)]/15 text-[var(--red)]',
  green: 'bg-[var(--green)]/15 text-[var(--green)]',
  blue: 'bg-[var(--blue)]/15 text-[var(--blue)]',
  gold: 'bg-[var(--gold)]/15 text-[var(--gold)]',
  purple: 'bg-[var(--purple)]/15 text-[var(--purple)]',
}

export function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
