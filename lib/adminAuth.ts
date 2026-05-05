import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { hasStoredAdminPassword, verifyStoredAdminPassword } from './adminPasswordStore';

export const ADMIN_SESSION_COOKIE = 'admin_session';

function getAdminPassword() {
    return process.env.ADMIN_PASSWORD || '';
}

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

export function getAllowedAdminEmails() {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmailAllowed(email?: string | null) {
    if (!email) return false;

    return getAllowedAdminEmails().includes(email.trim().toLowerCase());
}

export function isAdminConfigured() {
    return hasStoredAdminPassword() || getAdminPassword().length >= 10;
}

export function verifyAdminPassword(password: string) {
    if (verifyStoredAdminPassword(password)) {
        return true;
    }

    const expected = getAdminPassword();

    if (expected.length < 10 || password.length !== expected.length) {
        return false;
    }

    return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function createAdminSessionValue() {
    const issuedAt = Date.now().toString();
    const signature = createHmac('sha256', getSessionSecret()).update(issuedAt).digest('hex');

    return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionValue(value?: string) {
    if (!value || !isAdminConfigured()) return false;

    const [issuedAt, signature] = value.split('.');
    if (!issuedAt || !signature) return false;

    const timestamp = Number(issuedAt);
    const maxAgeMs = 1000 * 60 * 60 * 8;

    if (!Number.isFinite(timestamp) || Date.now() - timestamp > maxAgeMs) {
        return false;
    }

    const expected = createHmac('sha256', getSessionSecret()).update(issuedAt).digest('hex');

    try {
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}

export async function requireAdminSession() {
    const cookieStore = await cookies();
    return verifyAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
