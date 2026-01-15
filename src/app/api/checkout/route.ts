import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Force dynamic rendering - payment routes should never be cached
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
    try {
        // Dynamic base URL based on request origin
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const baseUrl = origin;

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            // Return demo URL for testing
            return NextResponse.json({
                url: `${baseUrl}/result`,
                demo: true,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_1SosOMRspUXORrtWWuOSC65s', // AuraPalette Report
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/result?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${baseUrl}/checkout`,
            metadata: {
                product: 'aurapalette_full_report',
                product_id: 'prod_TmRGodAQ97825u',
            },
        });

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}
