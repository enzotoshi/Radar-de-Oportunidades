import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> { label: string; children: ReactNode }

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, className = '', children, ...props }, ref) {
  return <button ref={ref} className={`icon-button ${className}`.trim()} aria-label={label} title={label} {...props}>{children}</button>
})

export default IconButton
