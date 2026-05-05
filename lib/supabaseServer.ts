import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let serverClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServerClient() {
    if (serverClient) return serverClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !key) {
        throw new Error('Missing Supabase environment variables.');
    }

    serverClient = createClient<Database>(supabaseUrl, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return serverClient;
}
