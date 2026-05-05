import { NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE,
    createAdminSessionValue,
} from '@/lib/adminAuth';
import {
    isRecoveryConfigured,
    saveAdminPassword,
    verifyRecoveryCode,
} from '@/lib/adminPasswordStore';

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({})) as {
        recoveryCode?: unknown;
        newPassword?: unknown;
    };
    const recoveryCode = String(body.recoveryCode || '');
    const newPassword = String(body.newPassword || '');

    if (!isRecoveryConfigured()) {
        return NextResponse.json(
            { error: 'Password recovery is not configured. Set ADMIN_RECOVERY_CODE on the server.' },
            { status: 503 },
        );
    }

    if (!verifyRecoveryCode(recoveryCode)) {
        return NextResponse.json({ error: 'Invalid recovery code.' }, { status: 401 });
    }

    if (newPassword.length < 10) {
        return NextResponse.json(
            { error: 'New password must be at least 10 characters.' },
            { status: 400 },
        );
    }

    saveAdminPassword(newPassword);

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
