import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (bypasses RLS)
// Creates a new client for each request to avoid caching issues in serverless
export function getServerSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing Supabase environment variables:', {
            hasUrl: !!url,
            hasKey: !!key
        });
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
