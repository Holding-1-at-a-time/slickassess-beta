import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ae98] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[#00ae98] text-white hover:bg-[#00ae98]/90 shadow-[0_0_15px_rgba(0,174,152,0.5)]",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]",
        outline: "border border-[#707070] bg-transparent hover:border-[#00ae98] hover:text-[#00ae98]",
        secondary: "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]",
        ghost: "bg-transparent hover:bg-[#2a2a2a] hover:text-[#00ae98]",
        link: "bg-transparent underline-offset-4 hover:underline text-white hover:text-[#00ae98]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md text-base",
        icon: "h-10 w-10",
      },
      glow: {
        true: "transition-shadow hover:shadow-[0_0_20px_rgba(0,174,152,0.8)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, glow, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
