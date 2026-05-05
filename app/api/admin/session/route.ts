import { NextResponse } from 'next/server';
import { isAdminConfigured, requireAdminSession } from '@/lib/adminAuth';

export async function GET() {
    return NextResponse.json({
        authenticated: await requireAdminSession(),
        configured: isAdminConfigured(),
    });
}
