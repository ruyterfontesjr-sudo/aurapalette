// Supabase Edge Function for AbacatePay Webhook
// URL: https://nhqfwgolbmdvloifexex.functions.supabase.co/abacate-billing-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

interface AbacatePayWebhookPayload {
  id: string
  event: 'billing.paid' | 'withdraw.done' | 'withdraw.failed'
  devMode: boolean
  data: {
    payment?: {
      amount: number
      fee: number
      method: string
    }
    billing?: {
      id: string
      amount: number
      status: string
      customer: {
        id: string
        metadata: {
          email?: string
          name?: string
          cellphone?: string
        }
      }
    }
    pixQrCode?: {
      id: string
      amount: number
      status: string
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // AbacatePay sends secret as query param OR header
    const webhookSecretFromQuery = url.searchParams.get('secret')
    const webhookSecretFromHeader = req.headers.get('x-webhook-secret')
    const webhookSecret = webhookSecretFromQuery || webhookSecretFromHeader

    const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET')

    console.log('Webhook secret check:', {
      received: webhookSecret ? 'present' : 'missing',
      expected: expectedSecret ? 'configured' : 'not configured'
    })

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload: AbacatePayWebhookPayload = await req.json()

    console.log('AbacatePay webhook received:', JSON.stringify(payload, null, 2))

    // Handle billing.paid event
    if (payload.event === 'billing.paid') {
      const { data } = payload

      console.log('PIX Payment completed:', {
        billingId: data.billing?.id,
        pixQrCodeId: data.pixQrCode?.id,
        amount: data.payment?.amount,
        status: data.billing?.status,
      })

      // Get the PIX ID
      const pixId = data.pixQrCode?.id || data.billing?.id

      if (pixId) {
        // Create Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update checkout status to paid
        const { data: updateData, error } = await supabase
          .from('checkouts')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('billing_id', pixId)
          .select()

        if (error) {
          console.error('Error updating checkout in Supabase:', error)
        } else {
          console.log('Checkout marked as paid in Supabase:', pixId, updateData)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AbacatePay webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
