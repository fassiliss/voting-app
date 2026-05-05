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

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
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
                .select('id, name, position')
                .order('id');

            const { data: allVotes } = await supabase
                .from('votes')
                .select('candidate_id');

            const { count } = await supabase
                .from('voters')
                .select('id', { count: 'exact', head: true })
                .eq('has_voted', true);

            setTotalVoters(count || 0);

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-2xl font-bold text-slate-950">Loading results...</div>
            </div>
        );
    }

    const getPositionLabel = (index: number) => {
        if (index === 0) return '1st Place';
        if (index === 1) return '2nd Place';
        if (index === 2) return '3rd Place';
        if (index === 3) return '4th Place';
        if (index === 4) return '5th Place';
        if (index === 5) return '6th Place';
        if (index === 6) return '7th Place';
        return `${index + 1}th Place`;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-slate-950">Voting Results</h1>
                            <p className="text-slate-800 mb-2 font-semibold text-lg">
                                Total Voters: <span className="font-bold text-blue-600">{totalVoters}</span>
                            </p>
                            <p className="text-slate-600 font-medium">
                                Ranked by total number of votes received
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-green-600 text-white px-6 py-3 rounded-md font-bold hover:bg-green-700 disabled:bg-slate-400 flex items-center gap-2"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh Results'}
                        </button>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-slate-950 font-semibold mb-4">No votes yet.</p>
                            <p className="text-slate-600 mb-6">Either no one has voted, or the election has been reset.</p>
                            <Link
                                href="/"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold"
                            >
                                Go Vote
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div
                                    key={result.candidate.id}
                                    className={`p-6 rounded-lg border ${
                                        index === 0
                                            ? 'bg-amber-50 border-amber-300'
                                            : index === 1
                                                ? 'bg-slate-50 border-slate-300'
                                                : index === 2
                                                    ? 'bg-orange-50 border-orange-300'
                                                    : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="text-xl md:text-2xl font-black text-slate-950 min-w-28">
                                                {getPositionLabel(index)}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-black text-slate-950">{result.candidate.name}</h3>
                                                <p className="text-slate-600 font-semibold mt-1">{result.candidate.position || 'Candidate'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right bg-white rounded-lg p-4 border border-slate-200">
                                            <div className="text-4xl font-black text-blue-600">
                                                {result.totalVotes}
                                            </div>
                                            <div className="text-slate-600 font-bold mt-1">
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
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold text-lg"
                        >
                            Back to Voting
                        </Link>
                    </div>
                </div>

                {results.length === 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4 text-slate-700">No Data Available</h2>
                        <p className="text-slate-600 mb-4">
                            The election appears to have been reset or no one has voted yet.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700"
                        >
                            Refresh to Check Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
