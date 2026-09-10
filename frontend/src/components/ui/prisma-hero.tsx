'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Check, Database, Filter, Radar, Search, Target, Zap } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './prisma-hero.module.css'

const platformRoute = '/radar'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const benefits = [
  { label: 'Menos busca manual', icon: Search },
  { label: 'Mais agilidade', icon: Zap },
  { label: 'Informações organizadas', icon: Check },
  { label: 'Oportunidades mais relevantes', icon: Target },
]

function RadarField() {
  return (
    <div className={styles.radarField} aria-hidden="true">
      <div className={styles.orbit} />
      <div className={styles.orbitInner} />
      <div className={styles.axisHorizontal} />
      <div className={styles.axisVertical} />
      <div className={styles.sweep} />
      <span className={`${styles.signal} ${styles.signalOne}`} />
      <span className={`${styles.signal} ${styles.signalTwo}`} />
      <span className={`${styles.signal} ${styles.signalThree}`} />
    </div>
  )
}

export function PrismaHero() {
  const problemRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLElement>(null)
  const benefitsRef = useRef<HTMLElement>(null)
  const problemIsVisible = useInView(problemRef, { once: true, margin: '-15% 0px' })
  const cardsAreVisible = useInView(cardsRef, { once: true, margin: '-12% 0px' })
  const benefitsAreVisible = useInView(benefitsRef, { once: true, margin: '-12% 0px' })

  return (
    <div className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.ambientOne} aria-hidden="true" />
        <div className={styles.ambientTwo} aria-hidden="true" />

        <nav className={styles.nav} aria-label="Navegação principal">
          <a className={styles.brand} href="#inicio" aria-label="Radar de Oportunidades — início">
            <span className={styles.brandMark}><Radar size={19} aria-hidden="true" /></span>
            <span>RADAR</span>
          </a>
          <div className={styles.navLinks}>
            <a href="#sobre">Sobre</a>
            <a href="#como-funciona">Como funciona</a>
          </div>
          <Link className={styles.navAccess} href={platformRoute}>
            Acessar <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </nav>

        <div id="inicio" className={styles.heroContent}>
          <motion.div
            className={styles.copy}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.11, delayChildren: 0.12 }}
          >
            <motion.p className={styles.eyebrow} variants={reveal} transition={{ duration: 0.55 }}>
              <span className={styles.liveDot} /> Inteligência territorial em movimento
            </motion.p>
            <h1 id="hero-title" className={styles.title}>
              <span className={styles.titleLine}>
                {'RADAR'.split('').map((letter, index) => (
                  <motion.span
                    key={`${letter}-${index}`}
                    variants={reveal}
                    transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
              <motion.span className={styles.titleSubline} variants={reveal} transition={{ duration: 0.6 }}>
                de oportunidades
              </motion.span>
            </h1>
            <motion.p className={styles.lead} variants={reveal} transition={{ duration: 0.6 }}>
              Transformando dados públicos em oportunidades reais.
            </motion.p>
            <motion.div className={styles.heroActions} variants={reveal} transition={{ duration: 0.6 }}>
              <Link className={styles.primaryCta} href={platformRoute}>
                Explorar Radar <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a className={styles.textLink} href="#como-funciona">Entenda em 30 segundos</a>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.visual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <RadarField />
            <div className={`${styles.dataTag} ${styles.dataTagTop}`}><span>FONTES ATIVAS</span><strong>12</strong></div>
            <div className={`${styles.dataTag} ${styles.dataTagBottom}`}><span>SINAL DETECTADO</span><strong>+ 84%</strong></div>
          </motion.div>
        </div>

        <div className={styles.heroFooter} aria-hidden="true">
          <span>01 — CAPTAR</span><span>02 — INTERPRETAR</span><span>03 — DECIDIR</span>
        </div>
      </section>

      <motion.section
        id="sobre"
        ref={problemRef}
        className={styles.problem}
        initial="hidden"
        animate={problemIsVisible ? 'visible' : 'hidden'}
        transition={{ staggerChildren: 0.12 }}
        aria-labelledby="problem-title"
      >
        <motion.p className={styles.sectionLabel} variants={reveal}>O desafio</motion.p>
        <motion.h2 id="problem-title" variants={reveal}>
          Existem muitas oportunidades.<br />O desafio é encontrar as relevantes.
        </motion.h2>
        <motion.p className={styles.problemCopy} variants={reveal}>
          O Radar organiza e analisa dados públicos para revelar sinais que apoiam decisões mais claras.
        </motion.p>

      </motion.section>

      <motion.section
        id="como-funciona"
        ref={cardsRef}
        className={styles.featureGrid}
        initial="hidden"
        animate={cardsAreVisible ? 'visible' : 'hidden'}
        transition={{ staggerChildren: 0.14 }}
        aria-label="Como o Radar transforma dados em oportunidades"
      >
        <motion.article className={styles.featureCard} variants={reveal} transition={{ duration: 0.58 }}>
          <p className={styles.cardLabel}>Como funciona</p>
          <h3>Do dado bruto ao sinal certo.</h3>
          <div className={styles.cardFlow} aria-label="Dados, análise, filtros e oportunidades">
            {[
              { label: 'Dados', icon: Database },
              { label: 'Análise', icon: BarChart3 },
              { label: 'Filtros', icon: Filter },
              { label: 'Oportunidades', icon: Target },
            ].map(({ label, icon: Icon }, index) => (
              <div className={styles.flowStep} key={label}>
                <span><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
                <small>{label}</small>
                {index < 3 && <span className={styles.flowConnector} aria-hidden="true"><i /></span>}
              </div>
            ))}
          </div>
        </motion.article>
      </motion.section>

      <motion.section
        ref={benefitsRef}
        className={styles.benefitsSection}
        initial="hidden"
        animate={benefitsAreVisible ? 'visible' : 'hidden'}
        transition={{ staggerChildren: 0.12 }}
        aria-labelledby="benefits-title"
      >
        <div className={styles.benefitsGridBackdrop} aria-hidden="true" />
        <motion.div className={styles.benefitsHeading} variants={reveal} transition={{ duration: 0.58 }}>
          <p className={styles.sectionLabel}>Benefícios</p>
          <h2 id="benefits-title">Mais clareza.<br />Menos esforço.</h2>
          <p>Informação útil no momento certo para decisões mais ágeis e relevantes.</p>
        </motion.div>
        <motion.div className={styles.benefitsPanels} variants={reveal} transition={{ duration: 0.58 }}>
          {benefits.map(({ label, icon: Icon }, index) => (
            <article className={styles.benefitPanel} key={label}>
              <span className={styles.benefitIndex}>0{index + 1}</span>
              <span className={styles.benefitIcon}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
              <strong>{label}</strong>
              <span className={styles.benefitSignal} aria-hidden="true"><i /></span>
            </article>
          ))}
        </motion.div>
      </motion.section>

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <div className={styles.finalGlow} aria-hidden="true" />
        <p className={styles.sectionLabel}>Próximo sinal</p>
        <h2 id="final-cta-title">Pronto para encontrar sua próxima oportunidade?</h2>
        <Link className={styles.primaryCta} href={platformRoute}>
          Acessar Radar <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
