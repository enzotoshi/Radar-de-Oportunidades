'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { gentleFade, uiSpring } from '@/lib/motion'

export default function DetailsSheet({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const controls = useAnimationControls()
  const reducedMotion = useReducedMotion()
  const close = async () => {
    await controls.start({ opacity: 0, y: reducedMotion ? 0 : 12 })
    dialog.current?.close()
  }
  useEffect(() => {
    if (open) {
      if (!dialog.current?.open) dialog.current?.showModal()
      controls.set({ opacity: 0, y: reducedMotion ? 0 : 12 })
      void controls.start({ opacity: 1, y: 0 })
    }
  }, [open, controls, reducedMotion])
  return (
    <>
      <button type="button" className="detail-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-controls={id}>
        {title}<ArrowUpRight size={17} />
      </button>
      <dialog id={id} ref={dialog} className="details-sheet" aria-labelledby={id + '-title'} onClose={() => setOpen(false)}
        onCancel={event => { event.preventDefault(); void close() }}
        onClick={event => { if (event.target === dialog.current) void close() }}>
        <motion.div className="sheet-content" initial={{ opacity: 0 }} animate={controls} transition={reducedMotion ? gentleFade : uiSpring}>
          <header><h2 id={id + '-title'}>{title}</h2><button autoFocus type="button" className="icon-button" title="Fechar detalhes" aria-label="Fechar detalhes" onClick={() => void close()}><X size={19} /></button></header>
          <div className="sheet-body">{children}</div>
        </motion.div>
      </dialog>
    </>
  )
}
