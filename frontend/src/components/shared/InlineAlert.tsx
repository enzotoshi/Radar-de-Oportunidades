import { AlertCircle, AlertTriangle, HelpCircle, type LucideIcon } from 'lucide-react'

interface InlineAlertProps { tone: 'info' | 'warning' | 'error'; children: React.ReactNode; role?: 'status' | 'alert' }
const icons: Record<InlineAlertProps['tone'], LucideIcon> = { info: HelpCircle, warning: AlertTriangle, error: AlertCircle }

export default function InlineAlert({ tone, children, role }: InlineAlertProps) {
  const Icon = icons[tone]
  return <div className={`inline-alert inline-alert--${tone}`} role={role}><Icon size={18} aria-hidden="true" /><div>{children}</div></div>
}
