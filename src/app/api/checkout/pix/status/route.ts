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
        const email = searchParams.get('email');

        if (!pixId) {
            return NextResponse.json(
                { error: 'PIX ID required' },
                { status: 400 }
            );
        }

        console.log('Checking PIX status for:', pixId, 'email:', email);

        // Debug info
        const debug: Record<string, unknown> = {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        };

        // Primeiro, verificar no Supabase (mais rápido pois o webhook já pode ter atualizado)
        try {
            const supabase = getServerSupabase();
            debug.supabaseClientCreated = true;

            // Strategy 1: Check by billing_id (pixId)
            let { data: checkoutResults, error: queryError } = await supabase
                .from('checkouts')
                .select('*')
                .eq('billing_id', pixId)
                .limit(1);

            debug.queryError = queryError;
            debug.checkoutResults = checkoutResults;

            console.log('Supabase query by billing_id:', { checkoutResults, queryError });

            let checkoutData = checkoutResults && checkoutResults.length > 0 ? checkoutResults[0] : null;

            // Strategy 2: If not found by billing_id, try by email (fallback)
            if (!checkoutData && email) {
                console.log('Trying fallback by email:', email);
                const { data: emailResults, error: emailError } = await supabase
                    .from('checkouts')
                    .select('status, billing_id, email')
                    .eq('email', email)
                    .order('created_at', { ascending: false })
                    .limit(1);

                debug.emailError = emailError;
                debug.emailResults = emailResults;

                console.log('Supabase query by email:', { emailResults, emailError });
                checkoutData = emailResults && emailResults.length > 0 ? emailResults[0] : null;
            }

            if (checkoutData) {
                console.log('Supabase checkout found:', checkoutData);

                if (checkoutData.status === 'paid') {
                    console.log('✅ Returning paid status from Supabase');
                    return NextResponse.json({
                        status: 'paid',
                        pixId: pixId,
                        source: 'supabase',
                        debug
                    });
                }
            } else {
                console.log('No checkout found in Supabase for pixId:', pixId, 'or email:', email);
            }
        } catch (supabaseError) {
            debug.supabaseError = String(supabaseError);
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
            debug
        });
    } catch (error) {
        console.error('Error checking PIX status:', error);
        return NextResponse.json(
            { error: 'Error checking PIX status', status: 'PENDING' },
            { status: 500 }
        );
    }
}
