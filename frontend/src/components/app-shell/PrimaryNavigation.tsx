import { Briefcase, LineChart, Map, type LucideIcon } from 'lucide-react'
import type { ActiveTab } from '@/types'

interface PrimaryNavigationProps { activeTab: ActiveTab; onNavigate: (tab: ActiveTab, focusContent?: boolean) => void }
const areas: Array<{ id: ActiveTab; label: string; compactLabel: string; icon: LucideIcon }> = [
  { id: 'map', label: 'Explorar', compactLabel: 'Explorar', icon: Map },
  { id: 'simulation', label: 'Simular', compactLabel: 'Simular', icon: LineChart },
  { id: 'gamification', label: 'Modo investidor', compactLabel: 'Investidor', icon: Briefcase },
]

export default function PrimaryNavigation({ activeTab, onNavigate }: PrimaryNavigationProps) {
  return <nav className="primary-navigation" aria-label="Áreas do Radar">{areas.map(({ id, label, compactLabel, icon: Icon }) =>
    <button key={id} type="button" className="nav-item" aria-label={label} aria-current={activeTab === id ? 'page' : undefined} onClick={() => onNavigate(id, true)}>
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" /><span className="nav-item__label">{label}</span><span className="nav-item__compact" aria-hidden="true">{compactLabel}</span>
    </button>,
  )}</nav>
}
