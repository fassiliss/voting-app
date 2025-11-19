'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Candidate {
    id: number;
    name: string;
    position: string;
}

export default function ManageCandidatesPage() {
    useAdminAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [newName, setNewName] = useState('');
    const [newPosition, setNewPosition] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if authenticated
        const isAuth = sessionStorage.getItem('adminAuth');
        if (isAuth) {
            setIsLoading(false);
            fetchCandidates();
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        window.location.href = '/admin/login';
    };

    const fetchCandidates = async () => {
        const { data } = await supabase
            .from('candidates')
            .select('*')
            .order('id');

        if (data) setCandidates(data);
    };

    const addCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase
            .from('candidates')
            .insert([{ name: newName, position: newPosition }]);

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('✅ Candidate added successfully!');
            setNewName('');
            setNewPosition('');
            fetchCandidates();
        }
        setLoading(false);
    };

    const deleteCandidate = async (id: number) => {
        if (!confirm('Are you sure you want to delete this candidate?')) return;

        const { error } = await supabase
            .from('candidates')
            .delete()
            .eq('id', id);

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('✅ Candidate deleted!');
            fetchCandidates();
        }
    };

    const startEdit = (candidate: Candidate) => {
        setEditingId(candidate.id);
        setEditName(candidate.name);
        setEditPosition(candidate.position);
    };

    const saveEdit = async () => {
        if (!editingId) return;

        const { error } = await supabase
            .from('candidates')
            .update({ name: editName, position: editPosition })
            .eq('id', editingId);

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('✅ Candidate updated!');
            setEditingId(null);
            fetchCandidates();
        }
    };

    const resetElection = async () => {
        if (!confirm('⚠️ This will DELETE ALL votes, voters, and candidates! Continue?')) return;

        setLoading(true);
        setMessage('🔄 Resetting election...');

        try {
            const { error: votesError } = await supabase
                .from('votes')
                .delete()
                .not('id', 'is', null);

            const { error: votersError } = await supabase
                .from('voters')
                .delete()
                .not('id', 'is', null);

            const { error: candidatesError } = await supabase
                .from('candidates')
                .delete()
                .not('id', 'is', null);

            if (votesError || votersError || candidatesError) {
                console.error('Errors:', { votesError, votersError, candidatesError });
                setMessage('❌ Error: ' + (votesError?.message || votersError?.message || candidatesError?.message));
            } else {
                setMessage('✅ Election reset complete!');
                setCandidates([]);
            }
        } catch (error) {
            console.error('Reset failed:', error);
            setMessage('❌ Reset failed');
        } finally {
            setLoading(false);
        }
    };

    // Loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-4">Loading...</div>
                    <p className="text-gray-600">Checking authentication</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-black">
                                Manage Candidates
                            </h1>
                            <p className="text-gray-700 font-semibold">
                                Add, edit, or delete candidates for your election
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700"
                        >
                            🚪 Logout
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded mb-6 font-semibold ${
                            message.includes('✅')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Add New Candidate */}
                    <form onSubmit={addCandidate} className="bg-blue-50 p-6 rounded-lg mb-8">
                        <h2 className="text-2xl font-bold text-black mb-4">Add New Candidate</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block font-bold mb-2 text-black">Name *</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-bold"
                                    style={{ color: '#000000' }}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2 text-black">Position/Title</label>
                                <input
                                    type="text"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-bold"
                                    style={{ color: '#000000' }}
                                    placeholder="e.g., Candidate, President, etc."
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Adding...' : '+ Add Candidate'}
                        </button>
                    </form>

                    {/* Candidates List */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-black mb-4">
                            Current Candidates ({candidates.length})
                        </h2>

                        {candidates.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No candidates yet. Add some above!</p>
                        ) : (
                            candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                    {editingId === candidate.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="px-4 py-2 border-2 border-blue-400 rounded font-bold"
                                                style={{ color: '#000000' }}
                                            />
                                            <input
                                                type="text"
                                                value={editPosition}
                                                onChange={(e) => setEditPosition(e.target.value)}
                                                className="px-4 py-2 border-2 border-blue-400 rounded font-bold"
                                                style={{ color: '#000000' }}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveEdit}
                                                    className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-black">{candidate.name}</h3>
                                                <p className="text-gray-700 font-semibold">{candidate.position || 'Candidate'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(candidate)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteCandidate(candidate.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Reset Election */}
                    <div className="mt-8 pt-8 border-t-2 border-gray-300">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Danger Zone</h2>
                        <button
                            onClick={resetElection}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700"
                        >
                            Reset Entire Election (Delete All Data)
                        </button>
                        <p className="text-sm text-gray-600 mt-2">This will delete all votes, voters, and candidates!</p>
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/admin"
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700"
                        >
                            Generate QR Code
                        </Link>
                        <Link
                            href="/results"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
                        >
                            View Results
                        </Link>
                        <Link
                            href="/"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            Voting Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}