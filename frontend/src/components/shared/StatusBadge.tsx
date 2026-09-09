import { AlertTriangle, CheckCircle2, Clock3, Info, type LucideIcon } from 'lucide-react'

interface StatusBadgeProps { tone?: 'success' | 'neutral' | 'info' | 'warning'; children: React.ReactNode }
const icons: Record<NonNullable<StatusBadgeProps['tone']>, LucideIcon> = { success: CheckCircle2, neutral: Clock3, info: Info, warning: AlertTriangle }

export default function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  const Icon = icons[tone]
  return <span className={`status-badge status-badge--${tone}`}><Icon size={14} aria-hidden="true" /><span>{children}</span></span>
}
