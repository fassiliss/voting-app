import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

function cleanText(value: unknown) {
    return String(value || '').trim().slice(0, 120);
}

export async function GET() {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data, error } = await getSupabaseServerClient()
        .from('candidates')
        .select('id, name, position')
        .order('id');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ candidates: data || [] });
}

export async function POST(request: Request) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({})) as { name?: unknown; position?: unknown };
    const name = cleanText(body.name);
    const position = cleanText(body.position) || 'Candidate';

    if (name.length < 2) {
        return NextResponse.json({ error: 'Candidate name must be at least 2 characters.' }, { status: 400 });
    }

    const { error } = await getSupabaseServerClient()
        .from('candidates')
        .insert([{ name, position }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
}
