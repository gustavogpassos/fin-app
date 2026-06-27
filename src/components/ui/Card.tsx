interface CardProps {
  accent?: 'red' | 'green' | 'blue' | 'gold'
  className?: string
  children: React.ReactNode
}

const accentColors: Record<string, string> = {
  red: 'border-l-[var(--red)]',
  green: 'border-l-[var(--green)]',
  blue: 'border-l-[var(--blue)]',
  gold: 'border-l-[var(--gold)]',
}

export function Card({ accent, className = '', children }: CardProps) {
  const border = accent ? `border-l-4 ${accentColors[accent]}` : ''
  return (
    <div className={`bg-[var(--card)] rounded-[var(--r)] p-4 ${border} ${className}`}>
      {children}
    </div>
  )
}
