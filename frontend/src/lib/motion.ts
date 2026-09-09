// Critically damped UI motion; native map and range gestures retain their physics.
export const uiSpring = { type: 'spring' as const, stiffness: 400, damping: 40, mass: 1 }
export const gentleFade = { duration: 0.12 }
