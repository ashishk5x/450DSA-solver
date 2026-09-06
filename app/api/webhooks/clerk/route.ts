import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || "re_123")

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    const email = email_addresses[0]?.email_address

    if (!email) {
      return new Response('No email found', { status: 400 })
    }

    try {
      // 1. Create Profile in Supabase
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: dbError } = await sb.from('profiles').insert({
        user_id: id,
        email: email,
        current_streak: 0,
        last_solve_date: null
      })

      if (dbError) {
        console.error('Failed to create profile:', dbError)
      }

      // 2. Send Welcome Email via Resend
      const { error: emailError } = await resend.emails.send({
        from: 'PatternFlow <anubhav@patternflowdsa.in>',
        to: [email],
        subject: 'Welcome to PatternFlow! Let\'s master DSA',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1814;">
            <h1 style="color: #1a1814;">Welcome to PatternFlow! 🚀</h1>
            <p>Hey there,</p>
            <p>Congratulations on taking the first step towards actually understanding Data Structures and Algorithms, instead of just memorizing code.</p>
            <p>At PatternFlow, we focus on <strong>patterns</strong>. Once you recognize the pattern, the code writes itself.</p>
            
            <div style="background-color: #faf8f3; padding: 20px; border-radius: 8px; border: 2px solid #1a1814; margin: 24px 0;">
              <h3 style="margin-top: 0;">Want the real interview experience?</h3>
              <p>To get the most out of PatternFlow, try our Interview Simulator. It features:</p>
              <ul>
                <li>⏱️ Timed pressure modes (Easy, Medium, Hard)</li>
                <li>🔒 Locked hints to force you to think</li>
                <li>🤖 Context-aware AI quizzes to test your deep understanding</li>
              </ul>
              <a href="https://patternflowdsa.in/#pricing" style="display: inline-block; background-color: #1a1814; color: #faf8f3; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Upgrade to Basic or Pro</a>
            </div>

            <p>Jump in and solve your first problem today!</p>
            <p>Happy coding,<br/>The PatternFlow Team</p>
          </div>
        `
      })

      if (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }

    } catch (err) {
      console.error('Webhook processing error:', err)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
