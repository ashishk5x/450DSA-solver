"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { ChevronRight, Loader2 } from "lucide-react"
import { analytics } from "@/lib/posthog-events"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

type Plan = "basic" | "pro"

interface PaymentButtonProps {
  plan: Plan
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({ plan, className, children }: PaymentButtonProps) {
  const { userId, isSignedIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!isSignedIn) {
      setError("Please sign in first")
      return
    }

    analytics.trackUpgradeClicked(plan)
    setLoading(true)
    setError("")

    try {
      // Create order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId }),
      })

      const orderData = await orderRes.json()

      if (orderData.error === "payments_not_configured") {
        setError("Payments launching soon!")
        setLoading(false)
        return
      }

      if (!orderRes.ok) {
        setError("Failed to create order. Try again.")
        setLoading(false)
        return
      }

      // Load Razorpay
      const loaded = await loadRazorpay()
      if (!loaded) {
        setError("Failed to load payment gateway.")
        setLoading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PatternFlow",
        description: orderData.planName,
        order_id: orderData.orderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              userId,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            try {
              analytics.trackPaymentSuccess(orderData.amount / 100, orderData.currency)
            } catch {
              console.log("Analytics blocked, continuing...")
            }
            window.location.href = "/dashboard?payment=success"
          } else {
            alert("Verification failed: " + (verifyData.error || "Unknown Error"))
            setError("Payment verification failed. Contact support.")
            setLoading(false)
          }
        },
        prefill: {},
        theme: { color: "#1a1814" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.")
        setLoading(false)
      })
      rzp.open()
    } catch {
      alert("Something went wrong with Razorpay. Try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Processing...
          </span>
        ) : (
          children || (
            <span className="flex items-center gap-2">
              Get {plan === "basic" ? "Basic" : "Pro"}
              <ChevronRight size={14} />
            </span>
          )
        )}
      </Button>
      {error && (
        <p className="mt-2 text-center font-mono text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}