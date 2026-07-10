import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-micro font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent/15 text-accent-light',
        secondary: 'border-border-subtle bg-elevated text-text-secondary',
        destructive: 'border-transparent bg-semantic-red-bg text-semantic-red',
        success: 'border-transparent bg-semantic-green-bg text-semantic-green',
        warning: 'border-transparent bg-semantic-yellow-bg text-semantic-yellow',
        outline: 'border-border text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
