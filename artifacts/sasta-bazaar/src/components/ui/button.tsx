import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]",
        outline: "border-2 border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-14 rounded-md px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
