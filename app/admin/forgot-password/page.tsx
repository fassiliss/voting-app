'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotAdminPasswordPage() {
    const router = useRouter();
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recoveryCode, newPassword }),
            });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                setError(data.error || 'Unable to reset password.');
                return;
            }

            router.push('/admin/manage');
        } catch {
            setError('Unable to reset password right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen app-page flex items-center justify-center px-4 py-12">
            <div className="app-panel rounded-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 app-heading">
                    Reset Admin Password
                </h1>
                <p className="text-center app-muted mb-8">
                    Use your private recovery code to create a new admin password.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-5">
                    <div>
                        <label className="block font-bold mb-2 app-heading" htmlFor="recovery-code">
                            Recovery Code
                        </label>
                        <input
                            id="recovery-code"
                            type="password"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.currentTarget.value)}
                            required
                            className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="Enter recovery code"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2 app-heading" htmlFor="new-password">
                            New Password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.currentTarget.value)}
                            required
                            minLength={10}
                            className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="At least 10 characters"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2 app-heading" htmlFor="confirm-password">
                            Confirm New Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                            required
                            minLength={10}
                            className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            placeholder="Repeat new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-lg hover:bg-blue-700 transition disabled:bg-slate-400"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/admin/login" className="text-blue-600 hover:underline font-semibold">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
