import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "destructive"
    active?: boolean
}

export function Badge({
    className = "",
    variant = "default",
    active = false,
    ...props
}: BadgeProps) {
    const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"

    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    }

    const activeStyles = active
        ? "bg-primary text-white border-primary"
        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"

    const finalClass = variant === "outline" // Special case for our chips
        ? `${baseStyles} ${activeStyles} ${className}`
        : `${baseStyles} ${variants[variant]} ${className}`

    return (
        <div className={finalClass} {...props} />
    )
}
