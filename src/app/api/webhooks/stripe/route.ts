import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Force dynamic rendering - webhooks should never be cached
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 400 }
            );
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerEmail = session.customer_details?.email;

            console.log('[Stripe Webhook] Payment completed:', {
                sessionId: session.id,
                customerEmail,
                amountTotal: session.amount_total,
                paymentStatus: session.payment_status,
            });

            // Save to Supabase for consistency with PIX flow
            if (SUPABASE_URL && SUPABASE_SERVICE_KEY && customerEmail) {
                try {
                    const insertUrl = `${SUPABASE_URL}/rest/v1/checkouts`;
                    const insertResponse = await fetch(insertUrl, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal',
                        },
                        body: JSON.stringify({
                            billing_id: session.id,
                            email: customerEmail,
                            amount: session.amount_total || 4700,
                            status: 'paid',
                            paid_at: new Date().toISOString(),
                        }),
                    });

                    if (insertResponse.ok) {
                        console.log('[Stripe Webhook] ✅ Saved to Supabase:', session.id);
                    } else {
                        console.error('[Stripe Webhook] Supabase insert error:', await insertResponse.text());
                    }
                } catch (supabaseError) {
                    console.error('[Stripe Webhook] Supabase error:', supabaseError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
