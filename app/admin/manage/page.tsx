'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Candidate {
    id: number;
    name: string;
    position: string;
}

export default function ManageCandidatesPage() {
    const router = useRouter();
    const { isAuthenticated, isChecking } = useAdminAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [newName, setNewName] = useState('');
    const [newPosition, setNewPosition] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const showError = useCallback((text: string) => setMessage(`Error: ${text}`), []);

    const fetchCandidates = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/candidates');
            const data = await response.json() as { error?: string; candidates?: Candidate[] };

            if (!response.ok) {
                showError(data.error || 'Unable to load candidates.');
                return;
            }

            setCandidates(data.candidates || []);
        } catch {
            showError('Unable to load candidates.');
        }
    }, [showError]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCandidates();
        }
    }, [fetchCandidates, isAuthenticated]);

    const addCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, position: newPosition }),
            });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                showError(data.error || 'Unable to add candidate.');
                return;
            }

            setMessage('Candidate added successfully.');
            setNewName('');
            setNewPosition('');
            await fetchCandidates();
        } catch {
            showError('Unable to add candidate.');
        } finally {
            setLoading(false);
        }
    };

    const deleteCandidate = async (id: number) => {
        if (!window.confirm('Delete this candidate? Existing votes for this candidate may also be affected.')) return;

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                showError(data.error || 'Unable to delete candidate.');
                return;
            }

            setMessage('Candidate deleted.');
            await fetchCandidates();
        } catch {
            showError('Unable to delete candidate.');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (candidate: Candidate) => {
        setEditingId(candidate.id);
        setEditName(candidate.name);
        setEditPosition(candidate.position);
    };

    const saveEdit = async () => {
        if (!editingId) return;

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`/api/admin/candidates/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, position: editPosition }),
            });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                showError(data.error || 'Unable to update candidate.');
                return;
            }

            setMessage('Candidate updated.');
            setEditingId(null);
            await fetchCandidates();
        } catch {
            showError('Unable to update candidate.');
        } finally {
            setLoading(false);
        }
    };

    const resetElection = async () => {
        if (!window.confirm('This will delete all votes, voters, and candidates. This cannot be undone.')) return;

        setLoading(true);
        setMessage('Resetting election...');

        try {
            const response = await fetch('/api/admin/reset', { method: 'POST' });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                showError(data.error || 'Unable to reset election.');
                return;
            }

            setMessage('Election reset complete.');
            setCandidates([]);
        } catch {
            showError('Unable to reset election.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    if (isChecking || !isAuthenticated) {
        return (
            <div className="min-h-screen app-page flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold app-heading mb-2">Checking access...</div>
                    <p className="app-muted">Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-page py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <section className="app-panel rounded-lg p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold app-heading">Manage Candidates</h1>
                            <p className="app-muted mt-1">Add, edit, or remove candidates for this election.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-slate-900 text-white px-5 py-3 rounded-md font-bold hover:bg-slate-700 transition"
                        >
                            Logout
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-md mb-6 font-medium ${
                            message.startsWith('Error')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-green-50 text-green-800 border border-green-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={addCandidate} className="app-subpanel p-5 rounded-lg mb-8">
                        <h2 className="text-xl font-bold app-heading mb-4">Add Candidate</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block font-bold mb-2 app-heading" htmlFor="new-name">Name *</label>
                                <input
                                    id="new-name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.currentTarget.value)}
                                    required
                                    maxLength={120}
                                    className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                    placeholder="Candidate name"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2 app-heading" htmlFor="new-position">Position/Title</label>
                                <input
                                    id="new-position"
                                    type="text"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.currentTarget.value)}
                                    maxLength={120}
                                    className="w-full px-4 py-3 app-input rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                    placeholder="Candidate, President, Board Member"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-5 py-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-slate-400 transition"
                        >
                            {loading ? 'Saving...' : 'Add Candidate'}
                        </button>
                    </form>

                    <div className="space-y-3">
                        <h2 className="text-xl font-bold app-heading">Current Candidates ({candidates.length})</h2>

                        {candidates.length === 0 ? (
                            <p className="app-muted text-center py-8 border border-dashed rounded-lg">
                                No candidates yet. Add the first candidate above.
                            </p>
                        ) : (
                            candidates.map((candidate) => (
                                <div key={candidate.id} className="app-panel p-4 rounded-lg">
                                    {editingId === candidate.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.currentTarget.value)}
                                                maxLength={120}
                                                className="px-4 py-3 app-input rounded-md"
                                            />
                                            <input
                                                type="text"
                                                value={editPosition}
                                                onChange={(e) => setEditPosition(e.currentTarget.value)}
                                                maxLength={120}
                                                className="px-4 py-3 app-input rounded-md"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} className="bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700">
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="app-input px-4 py-2 rounded-md font-bold hover:opacity-90">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold app-heading">{candidate.name}</h3>
                                                <p className="app-muted font-medium">{candidate.position || 'Candidate'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(candidate)} className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700">
                                                    Edit
                                                </button>
                                                <button onClick={() => deleteCandidate(candidate.id)} className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="app-panel rounded-lg border-red-300 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
                    <p className="app-muted mb-4">Resetting deletes all votes, voters, and candidates.</p>
                    <button
                        onClick={resetElection}
                        disabled={loading}
                        className="bg-red-600 text-white px-5 py-3 rounded-md font-bold hover:bg-red-700 disabled:bg-slate-400"
                    >
                        {loading ? 'Working...' : 'Reset Entire Election'}
                    </button>
                </section>

                <nav className="flex flex-wrap gap-3 justify-center">
                    <Link href="/admin" className="app-input px-5 py-3 rounded-md font-bold hover:opacity-90">
                        Generate QR Code
                    </Link>
                    <Link href="/results" className="bg-green-600 text-white px-5 py-3 rounded-md font-bold hover:bg-green-700">
                        View Results
                    </Link>
                    <Link href="/" className="bg-blue-600 text-white px-5 py-3 rounded-md font-bold hover:bg-blue-700">
                        Voting Page
                    </Link>
                </nav>
            </div>
        </div>
    );
}
