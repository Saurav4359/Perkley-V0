import { InrIcon } from "@/components/dashboard/inr-icon"
import { cn } from "@/lib/utils"

type RewardAmountProps = {
  amount: string
  size?: "sm" | "md"
  align?: "left" | "right"
  className?: string
}

const sizeStyles = {
  sm: {
    icon: "size-4",
    amount: "text-sm",
    currency: "text-xs",
  },
  md: {
    icon: "size-5",
    amount: "text-lg sm:text-xl",
    currency: "text-sm",
  },
} as const

export function RewardAmount({
  amount,
  size = "md",
  align = "right",
  className,
}: RewardAmountProps) {
  const styles = sizeStyles[size]

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        align === "right" ? "justify-end" : "justify-start",
        className
      )}
    >
      <InrIcon className={styles.icon} />
      <span className={cn("font-semibold tabular-nums text-reward", styles.amount)}>
        {amount}
      </span>
      <span className={cn("font-medium text-muted-foreground", styles.currency)}>INR</span>
    </div>
  )
}
