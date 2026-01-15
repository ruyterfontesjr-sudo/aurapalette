import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Status que indicam pagamento confirmado
const PAID_STATUSES = ['PAID', 'RECEIVED', 'COMPLETED', 'paid', 'received', 'completed', 'CONFIRMED', 'confirmed'];

// Headers para prevenir cache em TODAS as respostas
const noCacheHeaders = {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pixId = searchParams.get('id');
        const email = searchParams.get('email');

        if (!pixId) {
            return NextResponse.json(
                { error: 'PIX ID required' },
                { status: 400, headers: noCacheHeaders }
            );
        }

        console.log('[PIX Status] Checking:', pixId, 'email:', email, 'time:', new Date().toISOString());

        // Debug info
        const debug: Record<string, unknown> = {
            timestamp: Date.now(),
            hasSupabaseUrl: !!SUPABASE_URL,
            hasServiceKey: !!SUPABASE_SERVICE_KEY,
        };

        // Estratégia 1: Verificar no Supabase via REST API
        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
            try {
                // Query by billing_id
                const url = `${SUPABASE_URL}/rest/v1/checkouts?billing_id=eq.${encodeURIComponent(pixId)}&select=status,billing_id,email&limit=1`;
                console.log('[PIX Status] Supabase query:', url);

                const response = await fetch(url, {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                    },
                    cache: 'no-store',
                    next: { revalidate: 0 },
                });

                const results = await response.json();
                console.log('[PIX Status] Supabase response:', JSON.stringify(results));

                let checkoutData = results && results.length > 0 ? results[0] : null;

                // Fallback: buscar por email se não encontrou por billing_id
                if (!checkoutData && email) {
                    const emailUrl = `${SUPABASE_URL}/rest/v1/checkouts?email=eq.${encodeURIComponent(email)}&select=status,billing_id,email&order=created_at.desc&limit=1`;
                    console.log('[PIX Status] Email fallback query:', emailUrl);

                    const emailResponse = await fetch(emailUrl, {
                        headers: {
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                        },
                        cache: 'no-store',
                        next: { revalidate: 0 },
                    });

                    const emailResults = await emailResponse.json();
                    console.log('[PIX Status] Email fallback response:', JSON.stringify(emailResults));
                    checkoutData = emailResults && emailResults.length > 0 ? emailResults[0] : null;
                }

                debug.supabaseResult = checkoutData;

                if (checkoutData && checkoutData.status === 'paid') {
                    console.log('[PIX Status] ✅ PAID found in Supabase!');
                    return NextResponse.json(
                        {
                            status: 'paid',
                            pixId: pixId,
                            source: 'supabase',
                            debug
                        },
                        { headers: noCacheHeaders }
                    );
                }
            } catch (restError) {
                debug.supabaseError = String(restError);
                console.error('[PIX Status] Supabase error:', restError);
            }
        }

        // Estratégia 2: Verificar diretamente no AbacatePay
        if (!ABACATEPAY_API_KEY) {
            return NextResponse.json(
                { error: 'AbacatePay not configured', status: 'PENDING' },
                { status: 500, headers: noCacheHeaders }
            );
        }

        const timestamp = Date.now();
        const abacateUrl = `${ABACATEPAY_API_URL}/pixQrCode/check?id=${pixId}&_t=${timestamp}`;
        console.log('[PIX Status] AbacatePay query:', abacateUrl);

        const response = await fetch(abacateUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
            cache: 'no-store',
        });

        const data = await response.json();
        const abacateStatus = data.data?.status || 'PENDING';

        console.log('[PIX Status] AbacatePay response:', JSON.stringify(data));
        console.log('[PIX Status] AbacatePay status:', abacateStatus);

        debug.abacateStatus = abacateStatus;

        // Verificar se o status indica pagamento confirmado
        const isPaid = PAID_STATUSES.includes(abacateStatus);

        if (isPaid) {
            console.log('[PIX Status] ✅ PAID confirmed by AbacatePay!');

            // Atualizar Supabase
            if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
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
                        console.log('[PIX Status] Supabase updated to paid');
                    } else {
                        console.error('[PIX Status] Supabase update error:', await updateResponse.text());
                    }
                } catch (updateError) {
                    console.error('[PIX Status] Supabase update error:', updateError);
                }
            }

            return NextResponse.json(
                {
                    status: 'paid',
                    pixId: data.data?.id || pixId,
                    source: 'abacatepay',
                    debug
                },
                { headers: noCacheHeaders }
            );
        }

        // Ainda pendente
        console.log('[PIX Status] ⏳ Still pending:', abacateStatus);
        return NextResponse.json(
            {
                status: abacateStatus,
                pixId: data.data?.id || pixId,
                source: 'abacatepay',
                debug
            },
            { headers: noCacheHeaders }
        );

    } catch (error) {
        console.error('[PIX Status] Error:', error);
        return NextResponse.json(
            { error: 'Error checking PIX status', status: 'PENDING' },
            { status: 500, headers: noCacheHeaders }
        );
    }
}
