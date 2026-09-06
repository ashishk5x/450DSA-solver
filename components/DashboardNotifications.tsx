"use client"

import { useEffect } from "react"
import { toast } from "sonner"

type Props = {
  plan: string
  daysUntilExpiry: number | null
  paymentSuccess: boolean
}

export function DashboardNotifications({ plan, daysUntilExpiry, paymentSuccess }: Props) {
  useEffect(() => {
    // Payment success toast
    if (paymentSuccess) {
      toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated!`, {
        description: "All features are now unlocked. Happy solving!",
        duration: 5000,
      })
    }

    // Plan expiry warnings
    if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      const urgency = daysUntilExpiry <= 2

      setTimeout(() => {
        if (urgency) {
          toast.warning(`Plan expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}!`, {
            description: "Renew now to avoid losing access to your features and solve history.",
            duration: 8000,
            action: {
              label: "Renew →",
              onClick: () => { window.location.href = "/#pricing" },
            },
          })
        } else {
          toast.info(`Plan expires in ${daysUntilExpiry} days`, {
            description: "Consider renewing to keep your features active.",
            duration: 6000,
            action: {
              label: "View plans",
              onClick: () => { window.location.href = "/#pricing" },
            },
          })
        }
      }, 1500) // Delay so it doesn't overlap with success toast
    }

    // Plan expired (daysUntilExpiry is 0 or negative shouldn't happen since getUserPlan handles it,
    // but just in case the page is cached)
    if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
      setTimeout(() => {
        toast.error("Your plan has expired", {
          description: "You've been moved to the Free plan. Upgrade to restore your features.",
          duration: 10000,
          action: {
            label: "Upgrade →",
            onClick: () => { window.location.href = "/#pricing" },
          },
        })
      }, 1500)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This component only triggers toasts, renders nothing
  return null
}
