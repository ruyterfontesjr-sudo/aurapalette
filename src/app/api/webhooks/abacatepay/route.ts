import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

// Force dynamic rendering - webhooks should never be cached
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET || '';

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
        const webhookSecret = request.headers.get('x-webhook-secret');

        if (WEBHOOK_SECRET && webhookSecret !== WEBHOOK_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: AbacatePayWebhookPayload = await request.json();

        if (payload.event === 'billing.paid') {
            const { data } = payload;
            const pixId = data.pixQrCode?.id || data.billing?.id;

            if (pixId) {
                try {
                    const supabase = getServerSupabase();
                    await supabase
                        .from('checkouts')
                        .update({
                            status: 'paid',
                            paid_at: new Date().toISOString(),
                        })
                        .eq('billing_id', pixId);
                } catch {
                    // Continue even if update fails
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch {
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
