import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

interface CreatePixRequest {
    name: string;
    email: string;
    cellphone?: string;
    cpf: string; // taxId - obrigatório para PIX
}

export async function POST(request: NextRequest) {
    try {
        const body: CreatePixRequest = await request.json();

        if (!ABACATEPAY_API_KEY) {
            return NextResponse.json(
                { error: 'AbacatePay não configurado' },
                { status: 500 }
            );
        }

        // Validate CPF
        if (!body.cpf || body.cpf.length !== 11) {
            return NextResponse.json(
                { error: 'CPF inválido' },
                { status: 400 }
            );
        }

        // Format CPF: 123.456.789-01
        const cpfFormatted = `${body.cpf.slice(0, 3)}.${body.cpf.slice(3, 6)}.${body.cpf.slice(6, 9)}-${body.cpf.slice(9, 11)}`;
        const externalId = `aurapalette_${Date.now()}`;

        // Create PIX QR Code via AbacatePay
        const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
            },
            body: JSON.stringify({
                amount: 4700, // R$ 47,00 in cents
                expiresIn: 3600, // 1 hour in seconds
                description: 'Aura Palette - Relatório de Colorimetria',
                customer: {
                    name: body.name,
                    email: body.email,
                    cellphone: body.cellphone?.replace(/\D/g, '') || '11999999999',
                    taxId: cpfFormatted,
                },
                metadata: {
                    externalId: externalId,
                    product: 'aurapalette_report',
                },
            }),
        });

        const data = await response.json();

        console.log('AbacatePay response:', JSON.stringify(data, null, 2));

        if (data.error && data.error !== '<unknown>') {
            console.error('AbacatePay error:', data.error);
            return NextResponse.json(
                { error: `Erro ao gerar PIX: ${data.error}` },
                { status: 500 }
            );
        }

        if (!data.data) {
            console.error('AbacatePay no data:', data);
            return NextResponse.json(
                { error: 'Erro ao gerar QR Code PIX' },
                { status: 500 }
            );
        }

        // Salvar checkout no Supabase - usando estrutura correta da tabela
        try {
            const supabase = getServerSupabase();
            const { error: insertError } = await supabase.from('checkouts').insert({
                billing_id: data.data.id, // pix_id do AbacatePay
                email: body.email,
                amount: 4700,
                status: 'pending',
            });

            if (insertError) {
                console.error('Supabase insert error:', insertError);
            } else {
                console.log('Checkout saved to Supabase:', data.data.id);
            }
        } catch (supabaseError) {
            console.error('Error saving to Supabase:', supabaseError);
            // Não bloquear o fluxo se o Supabase falhar
        }

        return NextResponse.json({
            pixId: data.data.id,
            brCode: data.data.brCode,
            brCodeBase64: data.data.brCodeBase64,
            amount: data.data.amount,
            status: data.data.status,
            expiresAt: data.data.expiresAt,
        });
    } catch (error) {
        console.error('Error creating PIX:', error);
        return NextResponse.json(
            { error: 'Erro ao criar cobrança PIX' },
            { status: 500 }
        );
    }
}
