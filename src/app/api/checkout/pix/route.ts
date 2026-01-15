import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

// Force dynamic rendering - never cache payment routes
export const dynamic = 'force-dynamic';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

interface CreatePixRequest {
    name: string;
    email: string;
    cellphone?: string;
    cpf: string;
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

        if (!body.cpf || body.cpf.length !== 11) {
            return NextResponse.json(
                { error: 'CPF inválido' },
                { status: 400 }
            );
        }

        const cpfFormatted = `${body.cpf.slice(0, 3)}.${body.cpf.slice(3, 6)}.${body.cpf.slice(6, 9)}-${body.cpf.slice(9, 11)}`;
        const externalId = `aurapalette_${Date.now()}`;

        const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
            },
            body: JSON.stringify({
                amount: 4700,
                expiresIn: 3600,
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

        if (data.error && data.error !== '<unknown>') {
            return NextResponse.json(
                { error: `Erro ao gerar PIX: ${data.error}` },
                { status: 500 }
            );
        }

        if (!data.data) {
            return NextResponse.json(
                { error: 'Erro ao gerar QR Code PIX' },
                { status: 500 }
            );
        }

        // Salvar checkout no Supabase
        try {
            const supabase = getServerSupabase();
            await supabase.from('checkouts').insert({
                billing_id: data.data.id,
                email: body.email,
                amount: 4700,
                status: 'pending',
            });
        } catch {
            // Continue even if Supabase fails
        }

        return NextResponse.json({
            pixId: data.data.id,
            brCode: data.data.brCode,
            brCodeBase64: data.data.brCodeBase64,
            amount: data.data.amount,
            status: data.data.status,
            expiresAt: data.data.expiresAt,
        });
    } catch {
        return NextResponse.json(
            { error: 'Erro ao criar cobrança PIX' },
            { status: 500 }
        );
    }
}
