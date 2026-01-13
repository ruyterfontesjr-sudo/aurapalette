import { NextRequest, NextResponse } from 'next/server';

interface AbacatePayWebhookPayload {
    id: string;
    event: 'billing.paid' | 'withdraw.done' | 'withdraw.failed';
    devMode: boolean;
    data: {
        payment?: {
            amount: number;
            fee: number;
            method: string;
        };
        billing?: {
            id: string;
            amount: number;
            status: string;
            customer: {
                id: string;
                metadata: {
                    email?: string;
                    name?: string;
                    cellphone?: string;
                };
            };
        };
        pixQrCode?: {
            id: string;
            amount: number;
            status: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const payload: AbacatePayWebhookPayload = await request.json();

        console.log('AbacatePay webhook received:', {
            event: payload.event,
            id: payload.id,
            devMode: payload.devMode,
        });

        // Handle billing.paid event
        if (payload.event === 'billing.paid') {
            const { data } = payload;

            console.log('PIX Payment completed:', {
                billingId: data.billing?.id,
                amount: data.payment?.amount,
                customerEmail: data.billing?.customer?.metadata?.email,
                status: data.billing?.status,
            });

            // Here you could:
            // 1. Save to database
            // 2. Send confirmation email via WhatsApp/Email
            // 3. Update user payment status
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('AbacatePay webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
