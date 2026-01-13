import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (bypasses RLS)
export function createServerClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

// Get server client singleton
let serverClient: ReturnType<typeof createServerClient> | null = null;

export function getServerSupabase() {
    if (!serverClient) {
        serverClient = createServerClient();
    }
    return serverClient;
}
