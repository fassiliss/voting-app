import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST() {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { error: votesError } = await supabase.from('votes').delete().not('id', 'is', null);
    const { error: votersError } = await supabase.from('voters').delete().not('id', 'is', null);
    const { error: candidatesError } = await supabase.from('candidates').delete().not('id', 'is', null);
    const error = votesError || votersError || candidatesError;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
