import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

type StoredAdminPassword = {
    salt: string;
    hash: string;
    updatedAt: string;
};

const PASSWORD_FILE = join(process.cwd(), '.data', 'admin-password.json');

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
    const hash = scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

function readStoredPassword() {
    try {
        return JSON.parse(readFileSync(PASSWORD_FILE, 'utf8')) as StoredAdminPassword;
    } catch {
        return null;
    }
}

export function hasStoredAdminPassword() {
    return readStoredPassword() !== null;
}

export function getRecoveryCode() {
    return process.env.ADMIN_RECOVERY_CODE || '';
}

export function isRecoveryConfigured() {
    return getRecoveryCode().length >= 10;
}

export function verifyRecoveryCode(code: string) {
    const expected = getRecoveryCode();

    if (!isRecoveryConfigured() || code.length !== expected.length) {
        return false;
    }

    return timingSafeEqual(Buffer.from(code), Buffer.from(expected));
}

export function verifyStoredAdminPassword(password: string) {
    const stored = readStoredPassword();
    if (!stored) return false;

    const { hash } = hashPassword(password, stored.salt);

    try {
        return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(stored.hash, 'hex'));
    } catch {
        return false;
    }
}

export function saveAdminPassword(password: string) {
    const stored: StoredAdminPassword = {
        ...hashPassword(password),
        updatedAt: new Date().toISOString(),
    };

    mkdirSync(dirname(PASSWORD_FILE), { recursive: true });
    writeFileSync(PASSWORD_FILE, `${JSON.stringify(stored, null, 2)}\n`, { mode: 0o600 });
}
