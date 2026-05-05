'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 text-slate-950">
                    Admin Login
                </h1>
                <p className="text-center text-slate-600 mb-8">
                    Enter your admin password to manage this election.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block font-bold mb-2 text-lg text-black">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-md text-slate-950 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="Enter admin password"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-lg hover:bg-blue-700 transition disabled:bg-slate-400"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-center">
                    <Link
                        href="/admin/forgot-password"
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Forgot password?
                    </Link>
                    <Link
                        href="/"
                        className="text-slate-600 hover:text-slate-950 hover:underline font-semibold"
                    >
                        Back to Voting
                    </Link>
                </div>
        </div>
</div>
);
}
