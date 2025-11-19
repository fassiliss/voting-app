'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Candidate {
    id: number;
    name: string;
    position: string;
}

interface Result {
    candidate: Candidate;
    totalVotes: number;
}

interface Voter {
    id: number;
    voter_name: string;
    voter_email: string;
    voted_at: string;
}

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalVoters, setTotalVoters] = useState(0);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const { data: candidates } = await supabase
                .from('candidates')
                .select('*')
                .order('id');

            const { data: allVotes } = await supabase
                .from('votes')
                .select('*');

            const { data: votersData } = await supabase
                .from('voters')
                .select('*')
                .eq('has_voted', true)
                .order('voted_at', { ascending: false });

            setTotalVoters(votersData?.length || 0);
            setVoters(votersData || []);

            const resultsData: Result[] = (candidates || []).map((candidate) => {
                const candidateVotes = (allVotes || []).filter(v => v.candidate_id === candidate.id);

                return {
                    candidate,
                    totalVotes: candidateVotes.length,
                };
            });

            resultsData.sort((a, b) => b.totalVotes - a.totalVotes);
            setResults(resultsData);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchResults();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-2xl font-bold text-black">Loading results...</div>
            </div>
        );
    }

    const getPositionLabel = (index: number) => {
        if (index === 0) return '🥇 1st Place';
        if (index === 1) return '🥈 2nd Place';
        if (index === 2) return '🥉 3rd Place';
        if (index === 3) return '4th Place';
        if (index === 4) return '5th Place';
        if (index === 5) return '6th Place';
        if (index === 6) return '7th Place';
        return `${index + 1}th Place`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-black">Voting Results</h1>
                            <p className="text-gray-900 mb-2 font-semibold text-lg">
                                Total Voters: <span className="font-bold text-blue-600">{totalVoters}</span>
                            </p>
                            <p className="text-gray-700 font-medium">
                                Ranked by total number of votes received
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {refreshing ? (
                                <>
                                    <span className="animate-spin">🔄</span>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    🔄 Refresh Results
                                </>
                            )}
                        </button>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-900 font-semibold mb-4">No votes yet!</p>
                            <p className="text-gray-600 mb-6">Either no one has voted, or the election has been reset.</p>
                            <Link
                                href="/"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Go Vote
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div
                                    key={result.candidate.id}
                                    className={`p-8 rounded-lg border-2 ${
                                        index === 0
                                            ? 'bg-yellow-100 border-yellow-500'
                                            : index === 1
                                                ? 'bg-gray-100 border-gray-500'
                                                : index === 2
                                                    ? 'bg-orange-100 border-orange-500'
                                                    : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="text-5xl font-black text-black">
                                                {getPositionLabel(index)}
                                            </div>
                                            <div>
                                                <h3 className="text-4xl font-black text-black">{result.candidate.name}</h3>
                                                <p className="text-gray-700 font-semibold text-lg mt-1">{result.candidate.position}</p>
                                            </div>
                                        </div>
                                        <div className="text-right bg-white rounded-lg p-6 shadow-md">
                                            <div className="text-6xl font-black text-blue-600">
                                                {result.totalVotes}
                                            </div>
                                            <div className="text-lg text-gray-700 font-bold mt-2">
                                                {result.totalVotes === 1 ? 'vote' : 'votes'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
                        >
                            ← Back to Voting
                        </Link>
                    </div>
                </div>

                {voters.length > 0 && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <h2 className="text-3xl font-bold mb-6 text-black">Voters Who Voted ({voters.length})</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="px-4 py-3 text-left text-black font-bold text-lg">#</th>
                                    <th className="px-4 py-3 text-left text-black font-bold text-lg">Name</th>
                                    <th className="px-4 py-3 text-left text-black font-bold text-lg">Email</th>
                                    <th className="px-4 py-3 text-left text-black font-bold text-lg">Voted At</th>
                                </tr>
                                </thead>
                                <tbody>
                                {voters.map((voter, index) => (
                                    <tr key={voter.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-black font-bold text-lg">{index + 1}</td>
                                        <td className="px-4 py-3 text-black font-bold text-lg">{voter.voter_name}</td>
                                        <td className="px-4 py-3 text-black font-bold">{voter.voter_email}</td>
                                        <td className="px-4 py-3 text-gray-700 font-semibold">
                                            {new Date(voter.voted_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {voters.length === 0 && results.length === 0 && (
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">No Data Available</h2>
                        <p className="text-gray-600 mb-4">
                            The election appears to have been reset or no one has voted yet.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            🔄 Refresh to Check Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}