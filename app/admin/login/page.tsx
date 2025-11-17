'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Set your admin password here
        const ADMIN_PASSWORD = 'Grace2024!';

        if (password === ADMIN_PASSWORD) {
            // Store in session
            sessionStorage.setItem('adminAuth', 'true');
            router.push('/admin/manage');
        } else {
            setError('Invalid password!');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold text-center mb-2 text-black">
                    Admin Login
                </h1>
                <p className="text-center text-gray-700 mb-8 font-semibold">
                    Enter password to access admin panel
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-semibold">
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
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 font-bold"
                            style={{ color: '#000000' }}
                            placeholder="Enter admin password"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center">
                   <a
                    href="/"
                    className="text-blue-600 hover:underline font-semibold"
                    >
                    ← Back to Voting
                </a>
            </div>
        </div>
</div>
);
}