'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReactNode, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (key) {
    posthog.init(key, {
      api_host: host || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // Set to false for standard Next.js App Router manual pageview tracking if needed, or true for auto.
      capture_pageleave: true,
    })
  }
}

/**
 * Component to handle PostHog identification.
 */
export function PostHogAuth() {
  const { userId } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (userId && posthog) {
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        username: user?.username,
        fullName: user?.fullName,
      })
    } else if (!userId && posthog) {
      posthog.reset()
    }
  }, [userId, user])

  return null
}

export function PHProvider({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
