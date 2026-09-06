import posthog from 'posthog-js'

/**
 * Track a custom event in PostHog.
 * This can be used in client components.
 */
export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(event, properties)
  }
}

/**
 * Specific event trackers for the application.
 */
export const analytics = {
  // 1. When user submits a problem
  trackSolveClicked: () => trackEvent('solve_clicked'),
  
  // 2. When user unlocks/reveals a hint
  trackHintUnlocked: (hintNumber: number) => trackEvent('hint_unlocked', { hint_number: hintNumber }),
  
  // 3. When a paywall is displayed
  trackPaywallShown: (feature?: string) => trackEvent('paywall_shown', { feature }),
  
  // 4. When user clicks an upgrade/payment button
  trackUpgradeClicked: (plan?: string) => trackEvent('upgrade_clicked', { plan }),
  
  // 5. When a payment is successfully completed
  trackPaymentSuccess: (amount?: number, currency?: string) => trackEvent('payment_success', { amount, currency }),
}
