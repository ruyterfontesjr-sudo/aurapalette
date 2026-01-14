import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

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
        // Validar webhook secret (header x-webhook-secret)
        const webhookSecret = request.headers.get('x-webhook-secret');

        if (WEBHOOK_SECRET && webhookSecret !== WEBHOOK_SECRET) {
            console.error('Invalid webhook secret');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: AbacatePayWebhookPayload = await request.json();

        console.log('AbacatePay webhook received:', JSON.stringify(payload, null, 2));

        // Handle billing.paid event
        if (payload.event === 'billing.paid') {
            const { data } = payload;

            console.log('PIX Payment completed:', {
                billingId: data.billing?.id,
                pixQrCodeId: data.pixQrCode?.id,
                amount: data.payment?.amount,
                customerEmail: data.billing?.customer?.metadata?.email,
                status: data.billing?.status,
            });

            // Atualizar status no Supabase - usar billing_id
            const pixId = data.pixQrCode?.id || data.billing?.id;

            if (pixId) {
                try {
                    const supabase = getServerSupabase();
                    const { error, data: updateData } = await supabase
                        .from('checkouts')
                        .update({
                            status: 'paid',
                            paid_at: new Date().toISOString(),
                        })
                        .eq('billing_id', pixId)
                        .select();

                    if (error) {
                        console.error('Error updating checkout in Supabase:', error);
                    } else {
                        console.log('Checkout marked as paid in Supabase:', pixId, updateData);
                    }
                } catch (supabaseError) {
                    console.error('Supabase update error:', supabaseError);
                }
            }
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
