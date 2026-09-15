import Image from 'next/image'
import Link from 'next/link'
import { Database, MapPin } from 'lucide-react'
import radarLogo from '../../../public/logo-radar.png'
import type { ActiveTab } from '@/types'
import PrimaryNavigation from './PrimaryNavigation'
import StatusBadge from '../shared/StatusBadge'

interface AppHeaderProps { activeTab: ActiveTab; onNavigate: (tab: ActiveTab, focusContent?: boolean) => void; locationLabel: string; hasAnalysis: boolean }

export default function AppHeader({ activeTab, onNavigate, locationLabel, hasAnalysis }: AppHeaderProps) {
  return <header className="app-header"><div className="app-header__inner">
    <Link className="brand" href="/" aria-label="Voltar para a página inicial">
      <Image className="brand-logo" src={radarLogo} alt="" width={44} height={44} priority />
    </Link>
    <PrimaryNavigation activeTab={activeTab} onNavigate={onNavigate} />
    <div className="header-context"><span className="header-context__location"><MapPin size={15} aria-hidden="true" />{locationLabel}</span>
      <StatusBadge tone={hasAnalysis ? 'success' : 'neutral'}>{hasAnalysis ? 'Análise disponível' : 'Aguardando análise'}</StatusBadge>
      <span className="header-context__source"><Database size={14} aria-hidden="true" />Fontes públicas</span>
    </div>
  </div></header>
}
