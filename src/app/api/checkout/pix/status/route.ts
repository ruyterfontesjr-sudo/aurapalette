import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

// Status que indicam pagamento confirmado
const PAID_STATUSES = ['PAID', 'RECEIVED', 'COMPLETED', 'paid', 'received', 'completed', 'CONFIRMED', 'confirmed'];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pixId = searchParams.get('id');

        if (!pixId) {
            return NextResponse.json(
                { error: 'PIX ID required' },
                { status: 400 }
            );
        }

        console.log('Checking PIX status for:', pixId);
        console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

        // Primeiro, verificar no Supabase (mais rápido pois o webhook já pode ter atualizado)
        try {
            const supabase = getServerSupabase();
            console.log('Supabase client created, querying...');

            const { data: checkoutData, error: queryError } = await supabase
                .from('checkouts')
                .select('status, billing_id, email')
                .eq('billing_id', pixId)
                .single();

            console.log('Supabase query result:', { checkoutData, queryError });

            if (queryError) {
                console.log('Supabase query error:', JSON.stringify(queryError));
            } else {
                console.log('Supabase checkout found:', checkoutData);
            }

            if (checkoutData?.status === 'paid') {
                console.log('Returning paid status from Supabase');
                return NextResponse.json({
                    status: 'paid',
                    pixId: pixId,
                    source: 'supabase'
                });
            }
        } catch (supabaseError) {
            console.log('Supabase query failed:', supabaseError);
        }

        if (!ABACATEPAY_API_KEY) {
            return NextResponse.json(
                { error: 'AbacatePay not configured' },
                { status: 500 }
            );
        }

        // Check PIX status via AbacatePay
        const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/check?id=${pixId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
            },
        });

        const data = await response.json();
        const abacateStatus = data.data?.status || 'PENDING';

        console.log('AbacatePay status response:', JSON.stringify(data, null, 2));
        console.log('AbacatePay status:', abacateStatus);

        // Verificar se o status indica pagamento confirmado
        const isPaid = PAID_STATUSES.includes(abacateStatus);

        if (isPaid) {
            // Atualizar Supabase se ainda não estiver pago
            try {
                const supabase = getServerSupabase();
                const { error: updateError } = await supabase
                    .from('checkouts')
                    .update({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                    })
                    .eq('billing_id', pixId);

                if (updateError) {
                    console.error('Error updating Supabase:', updateError);
                } else {
                    console.log('Updated Supabase status to paid for:', pixId);
                }
            } catch (updateError) {
                console.error('Error updating Supabase:', updateError);
            }
        }

        return NextResponse.json({
            status: isPaid ? 'paid' : abacateStatus,
            pixId: data.data?.id,
            raw: abacateStatus,
        });
    } catch (error) {
        console.error('Error checking PIX status:', error);
        return NextResponse.json(
            { error: 'Error checking PIX status', status: 'PENDING' },
            { status: 500 }
        );
    }
}
