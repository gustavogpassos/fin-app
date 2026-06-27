interface PanelProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Panel({ title, action, children, className = '' }: PanelProps) {
  return (
    <div className={`bg-[var(--card)] rounded-[var(--r)] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
