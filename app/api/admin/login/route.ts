import { NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE,
    createAdminSessionValue,
    isAdminConfigured,
    verifyAdminPassword,
} from '@/lib/adminAuth';

export async function POST(request: Request) {
    const { password } = await request.json().catch(() => ({ password: '' })) as { password?: unknown };

    if (!isAdminConfigured()) {
        return NextResponse.json(
            { error: 'Admin password is not configured. Set ADMIN_PASSWORD on the server.' },
            { status: 503 },
        );
    }

    if (!verifyAdminPassword(String(password || ''))) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
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
