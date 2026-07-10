import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-body font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent-light',
        secondary: 'bg-elevated text-text-primary border border-border hover:border-border-hover hover:bg-hover',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-hover',
        destructive: 'bg-semantic-red/10 text-semantic-red hover:bg-semantic-red/20',
        outline: 'border border-border bg-transparent hover:bg-hover hover:border-border-hover',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-secondary',
        lg: 'h-12 rounded-lg px-6 text-card-title',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
