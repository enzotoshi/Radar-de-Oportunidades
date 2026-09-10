import { PrismaHero } from '@/components/ui/prisma-hero'
import styles from './landing.module.css'

export default function Home() {
  return (
    <main className={styles.landing}>
      <PrismaHero />
    </main>
  )
}
