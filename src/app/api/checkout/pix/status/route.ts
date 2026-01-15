import { NextRequest, NextResponse } from 'next/server';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
            hasSupabaseUrl: !!SUPABASE_URL,
            hasServiceKey: !!SUPABASE_SERVICE_KEY,
            supabaseUrlPrefix: SUPABASE_URL?.substring(0, 30),
        };

        // Usar REST API diretamente para evitar problemas de cache do JS client
        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
            try {
                // Strategy 1: Check by billing_id
                const url = `${SUPABASE_URL}/rest/v1/checkouts?billing_id=eq.${encodeURIComponent(pixId)}&select=status,billing_id,email&limit=1`;
                debug.queryUrl = url;
                console.log('Querying Supabase REST API:', url);

                const response = await fetch(url, {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Cache-Control': 'no-cache',
                    },
                });

                debug.responseStatus = response.status;
                const results = await response.json();
                debug.results = results;
                console.log('Supabase REST response:', results);

                let checkoutData = results && results.length > 0 ? results[0] : null;

                // Strategy 2: If not found by billing_id, try by email
                if (!checkoutData && email) {
                    const emailUrl = `${SUPABASE_URL}/rest/v1/checkouts?email=eq.${encodeURIComponent(email)}&select=status,billing_id,email&order=created_at.desc&limit=1`;
                    console.log('Trying email fallback:', emailUrl);

                    const emailResponse = await fetch(emailUrl, {
                        headers: {
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                            'Cache-Control': 'no-cache',
                        },
                    });

                    const emailResults = await emailResponse.json();
                    console.log('Supabase email response:', emailResults);
                    checkoutData = emailResults && emailResults.length > 0 ? emailResults[0] : null;
                }

                debug.checkoutData = checkoutData;

                if (checkoutData && checkoutData.status === 'paid') {
                    console.log('✅ Found paid status via REST API');
                    return NextResponse.json({
                        status: 'paid',
                        pixId: pixId,
                        source: 'supabase-rest',
                        debug
                    });
                }
            } catch (restError) {
                debug.restError = String(restError);
                console.error('Supabase REST error:', restError);
            }
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

        if (isPaid && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
            // Atualizar Supabase se ainda não estiver pago (via REST API)
            try {
                const updateUrl = `${SUPABASE_URL}/rest/v1/checkouts?billing_id=eq.${encodeURIComponent(pixId)}`;
                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                    }),
                });

                if (updateResponse.ok) {
                    console.log('Updated Supabase status to paid for:', pixId);
                } else {
                    console.error('Error updating Supabase:', await updateResponse.text());
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
