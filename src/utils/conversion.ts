declare global {
    interface Window {
        gtag: (command: string, action: string, params?: any) => void;
    }
}

export interface ConversionData {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    transactionId?: string;
    value?: number;
    currency?: string;
}

// Helper to hash data using SHA-256
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize and hash personal data
async function hashData(data: string): Promise<string> {
    // Normalize: remove whitespace, convert to lowercase
    const normalized = data.trim().toLowerCase();
    return await sha256(normalized);
}

// Normalize phone number (E.164 format preferably, but at least digits only)
function normalizePhone(phone: string): string {
    // Remove all non-digits
    return phone.replace(/\D/g, '');
}

export async function sendPurchaseEvent(data: ConversionData) {
    try {
        if (typeof window === 'undefined' || !window.gtag) {
            console.warn('GTag not available');
            return;
        }

        const enhancedConversionData: any = {};

        if (data.email) {
            enhancedConversionData.email = await hashData(data.email);
        }

        if (data.phone) {
            const cleanPhone = normalizePhone(data.phone);
            // Assuming BR numbers, add +55 if missing
            const formattedPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55')
                ? `+55${cleanPhone}`
                : `+${cleanPhone}`;
            enhancedConversionData.phone_number = await hashData(formattedPhone);
        }

        if (data.firstName) {
            enhancedConversionData.first_name = await hashData(data.firstName);
        }

        if (data.lastName) {
            enhancedConversionData.last_name = await hashData(data.lastName);
        }

        console.log('Sending purchase event with enhanced data:', enhancedConversionData);

        // Send the event
        window.gtag('event', 'purchase', {
            send_to: 'AW-17872778006/mhB7CML0neIbEJbms8pC',
            transaction_id: data.transactionId || `TXN_${Date.now()}`,
            value: data.value || 47.00,
            currency: data.currency || 'BRL',
            enhanced_conversion_data: enhancedConversionData,
        });

    } catch (error) {
        console.error('Error sending purchase event:', error);
    }
}
