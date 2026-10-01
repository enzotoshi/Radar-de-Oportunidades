export const motionDuration = { instant: 0.1, fast: 0.18, base: 0.26 }
export const panelTransition = { type: 'spring' as const, stiffness: 420, damping: 42, mass: 1 }
export const viewFade = { duration: motionDuration.fast }
export const resultReveal = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }

// Compatibility aliases while domain components migrate to named motion.
export const uiSpring = panelTransition
export const gentleFade = viewFade
