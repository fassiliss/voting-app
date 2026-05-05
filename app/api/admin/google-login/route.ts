import { NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE,
    createAdminSessionValue,
    getAllowedAdminEmails,
    isAdminEmailAllowed,
} from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({})) as { accessToken?: unknown };
    const accessToken = String(body.accessToken || '');

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing Google login token.' }, { status: 400 });
    }

    if (getAllowedAdminEmails().length === 0) {
        return NextResponse.json(
            { error: 'Google admin login is not configured. Set ADMIN_EMAILS on the server.' },
            { status: 503 },
        );
    }

    const { data, error } = await getSupabaseServerClient().auth.getUser(accessToken);
    const email = data.user?.email;

    if (error || !isAdminEmailAllowed(email)) {
        return NextResponse.json({ error: 'This Google account is not allowed for admin access.' }, { status: 403 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
    });

    return response;
}
