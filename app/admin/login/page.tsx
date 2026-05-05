'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        async function finishGoogleLogin() {
            if (!window.location.search.includes('google=1')) return;

            setGoogleLoading(true);
            setError('');

            try {
                const { data, error: sessionError } = await supabase.auth.getSession();
                const accessToken = data.session?.access_token;

                if (sessionError || !accessToken) {
                    setError('Google login did not complete. Please try again.');
                    return;
                }

                const response = await fetch('/api/admin/google-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken }),
                });
                const result = await response.json() as { error?: string };

                if (!response.ok) {
                    setError(result.error || 'Google login is not allowed for this admin account.');
                    return;
                }

                await supabase.auth.signOut();
                if (!cancelled) router.push('/admin/manage');
            } catch {
                setError('Unable to complete Google login right now.');
            } finally {
                if (!cancelled) setGoogleLoading(false);
            }
        }

        finishGoogleLogin();

        return () => {
            cancelled = true;
        };
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                setError(data.error || 'Unable to sign in.');
                setPassword('');
                return;
            }

            router.push('/admin/manage');
        } catch {
            setError('Unable to sign in right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);

        const { error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin/login?google=1`,
            },
        });

        if (googleError) {
            setError(googleError.message);
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen app-page flex items-center justify-center px-4 py-12">
            <div className="app-panel rounded-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 app-heading">
                    Admin Login
                </h1>
                <p className="text-center app-muted mb-8">
                    Sign in to manage this election.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full app-input py-3 rounded-md font-bold text-lg hover:opacity-90 transition disabled:opacity-60"
                >
                    {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </button>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm font-semibold text-slate-500">or continue with email</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block font-bold mb-2 app-heading" htmlFor="admin-email">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2 app-heading" htmlFor="admin-password">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                            className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            autoFocus
                        />
                    </div>

                    <div className="text-right">
                        <Link
                            href="/admin/forgot-password"
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-lg hover:bg-blue-700 transition disabled:bg-slate-400"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="app-muted hover:opacity-80 hover:underline font-semibold"
                    >
                        Back to Voting
                    </Link>
                </div>
        </div>
</div>
);
}
