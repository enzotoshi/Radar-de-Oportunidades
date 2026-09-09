import { Calculator, Database, TrendingUp, type LucideIcon } from 'lucide-react'
import type { DataKind } from '@/types'

const kinds: Record<DataKind, { label: string; icon: LucideIcon }> = {
  real: { label: 'Observado', icon: Database }, estimated: { label: 'Estimado', icon: TrendingUp }, calculated: { label: 'Calculado', icon: Calculator },
}

export default function DataKindBadge({ kind }: { kind: DataKind }) {
  const { label, icon: Icon } = kinds[kind]
  return <span className={`data-kind-badge data-kind-badge--${kind}`}><Icon size={13} aria-hidden="true" />{label}</span>
}
