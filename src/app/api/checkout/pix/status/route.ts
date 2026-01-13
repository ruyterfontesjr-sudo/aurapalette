import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

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

        // Primeiro, verificar no Supabase (mais rápido pois o webhook já pode ter atualizado)
        try {
            const supabase = getServerSupabase();
            const { data: checkoutData } = await supabase
                .from('checkouts')
                .select('status')
                .eq('pix_id', pixId)
                .single();

            if (checkoutData?.status === 'paid') {
                return NextResponse.json({
                    status: 'paid',
                    pixId: pixId,
                });
            }
        } catch {
            // Se falhar, continua para verificar na AbacatePay
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

        return NextResponse.json({
            status: data.data?.status || 'PENDING',
            pixId: data.data?.id,
        });
    } catch (error) {
        console.error('Error checking PIX status:', error);
        return NextResponse.json(
            { error: 'Error checking PIX status', status: 'PENDING' },
            { status: 500 }
        );
    }
}
