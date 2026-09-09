import { ArrowUpRight } from 'lucide-react'
import type { AnalysisResult } from '@/types'
import { formatCollectedAt } from '@/lib/formatters'
import DetailsSheet from '../DetailsSheet'

export default function ProvenanceDialog({ result }: { result: AnalysisResult }) {
  return <DetailsSheet title="Fontes e metodologia">
    <h3>Metodologia própria</h3><p>{result.methodology.formula}</p><p>Este índice é educacional. Não é indicador oficial nem probabilidade de sucesso.</p>
    <div className="source-list">{result.sources.map(source => <a key={`${source.name}-${source.url}`} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.name}</strong><small>{source.status}{source.reference ? ` · ref. ${source.reference}` : ''}{source.license ? ` · ${source.license}` : ''}</small></span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div>
    <p>Coleta: {formatCollectedAt(result.collected_at)}</p>
  </DetailsSheet>
}
