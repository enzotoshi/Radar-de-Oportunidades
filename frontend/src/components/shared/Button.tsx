import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet'
  size?: 'default' | 'compact'
  busy?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'default', busy = false, disabled, className = '', children, ...props }, ref,
) {
  return <button ref={ref} className={`button button--${variant} button--${size} ${className}`.trim()} aria-busy={busy || undefined} disabled={disabled || busy} {...props}>
    {busy && <Loader2 className="button__spinner" size={17} aria-hidden="true" />}<span>{children}</span>
  </button>
})

export default Button
