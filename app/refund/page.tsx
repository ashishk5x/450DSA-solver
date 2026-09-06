/* eslint-disable */
import { Navbar } from "@/components/Navbar"
import { Code2 } from "lucide-react"
import Link from "next/link"

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-mono text-sm text-muted-foreground/70 mb-2">// legal</p>
        <h1 className="text-3xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="font-mono text-xs text-muted-foreground/70 mb-12">Last updated: April 23, 2025</p>

        <div className="space-y-10 text-muted-foreground text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Our refund policy</h2>
            <p>We want you to be completely satisfied with PatternFlow. If you are not happy with your purchase, we offer a straightforward refund policy.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7-day money back guarantee</h2>
            <p>If you are not satisfied with your paid subscription within the first <strong className="text-foreground">7 days</strong> of purchase, you are eligible for a full refund — no questions asked.</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Request must be made within 7 days of initial purchase</li>
              <li>Refund will be processed within 5-7 business days</li>
              <li>Refund will be credited to the original payment method</li>
              <li>One refund per user</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Renewals</h2>
            <p>For monthly subscription renewals, refunds are not available after the renewal charge has been processed. Please cancel your subscription before the renewal date to avoid charges.</p>
            <p className="mt-2">You can cancel your subscription anytime from your dashboard.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">How to request a refund</h2>
            <p>To request a refund, contact us within 7 days of purchase:</p>
            <div className="mt-3 rounded-lg border border-border bg-card p-4">
              <p className="font-mono text-xs text-muted-foreground/70 mb-2">Contact us via</p>
              
                href="https://twitter.com/Dev_code_04"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-foreground underline hover:opacity-70"
              <a>
                @Dev_code_04 on Twitter
              </a>
              <p className="mt-2 text-xs text-muted-foreground/70">Include your registered email and payment date in your message.</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Exceptions</h2>
            <p>Refunds will not be issued if:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>The 7-day window has passed</li>
              <li>Account has been terminated for violating Terms of Service</li>
              <li>Refund has already been issued for a previous subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Free tier</h2>
            <p>The free tier of PatternFlow is completely free with no payment required. There is nothing to refund for free tier usage.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border bg-secondary py-6">
        <div className="mx-auto max-w-3xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground/70" />
            <span className="font-mono text-sm text-muted-foreground/70">PatternFlow</span>
          </div>
          <div className="flex gap-4 font-mono text-xs text-muted-foreground/70">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/refund" className="hover:text-foreground">Refund</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}