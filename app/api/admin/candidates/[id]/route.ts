import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

type RouteContext = {
    params: Promise<{ id: string }>;
};

function cleanText(value: unknown) {
    return String(value || '').trim().slice(0, 120);
}

function parseId(id: string) {
    const candidateId = Number(id);
    return Number.isInteger(candidateId) && candidateId > 0 ? candidateId : null;
}

export async function PATCH(request: Request, context: RouteContext) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const candidateId = parseId(id);
    if (!candidateId) {
        return NextResponse.json({ error: 'Invalid candidate id.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({})) as { name?: unknown; position?: unknown };
    const name = cleanText(body.name);
    const position = cleanText(body.position) || 'Candidate';

    if (name.length < 2) {
        return NextResponse.json({ error: 'Candidate name must be at least 2 characters.' }, { status: 400 });
    }

    const { error } = await getSupabaseServerClient()
        .from('candidates')
        .update({ name, position })
        .eq('id', candidateId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const candidateId = parseId(id);
    if (!candidateId) {
        return NextResponse.json({ error: 'Invalid candidate id.' }, { status: 400 });
    }

    const { error } = await getSupabaseServerClient()
        .from('candidates')
        .delete()
        .eq('id', candidateId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
