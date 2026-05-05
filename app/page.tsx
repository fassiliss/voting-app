'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

interface Candidate {
    id: number;
    name: string;
    position: string;
}

export default function VotingPage() {
    const [voterName, setVoterName] = useState('');
    const [voterEmail, setVoterEmail] = useState('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [step, setStep] = useState<'login' | 'vote'>('login');
    const [voterId, setVoterId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

    useEffect(() => {
        fetchCandidates();
    }, []);
    useEffect(() => {
        // Get device fingerprint only on client side
        if (typeof window !== 'undefined') {
            getDeviceFingerprint()
                .then(setDeviceFingerprint)
                .catch(() => setError('Unable to verify this device. Please refresh and try again.'));
        }
    }, []);

    const fetchCandidates = async () => {
        const { data, error } = await supabase
            .from('candidates')
            .select('id, name, position')
            .order('id');

        if (error) {
            setError('Unable to load candidates. Please try again later.');
            return;
        }

        if (data) setCandidates(data);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanName = voterName.trim();
        const cleanEmail = voterEmail.trim().toLowerCase();

        if (cleanName.length < 2) {
            setError('Please enter your full name.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setError('Please enter a valid email address (e.g., name@example.com)');
            return;
        }

        // Make sure we have device fingerprint
        if (!deviceFingerprint) {
            setError('Unable to verify device. Please refresh and try again.');
            return;
        }

        // Check if this device has already voted
        const { data: deviceCheck } = await supabase
            .from('voters')
            .select('id')
            .eq('device_fingerprint', deviceFingerprint)
            .eq('has_voted', true)
            .single();

        if (deviceCheck) {
            setError('This device has already been used to vote!');
            return;
        }

        // Check if email already voted
        const { data: existingVoter } = await supabase
            .from('voters')
            .select('id, has_voted')
            .eq('voter_email', cleanEmail)
            .single();

        if (existingVoter?.has_voted) {
            setError('You have already voted with this email!');
            return;
        }

        // Create or update voter
        if (existingVoter) {
            // Update existing voter with device fingerprint
            const { error: updateVoterError } = await supabase
                .from('voters')
                .update({ device_fingerprint: deviceFingerprint })
                .eq('id', existingVoter.id);

            if (updateVoterError) {
                setError(updateVoterError.message);
                return;
            }

            setVoterId(existingVoter.id);
        } else {
            // Create new voter with device fingerprint
            const { data: newVoter, error: newVoterError } = await supabase
                .from('voters')
                .insert([{
                    voter_name: cleanName,
                    voter_email: cleanEmail,
                    device_fingerprint: deviceFingerprint
                }])
                .select('id')
                .single();

            if (newVoterError) {
                setError(newVoterError.message);
                return;
            }

            if (newVoter?.id) setVoterId(newVoter.id);
        }

        setStep('vote');
    };

    const handleCandidateSelect = (candidateId: number) => {
        setSelectedCandidateId(candidateId);
    };

    const handleSubmitVote = async () => {
        setError('');

        if (!selectedCandidateId) {
            setError('Please select a candidate.');
            return;
        }

        if (!voterId) {
            setError('Your voter session could not be verified. Please start again.');
            return;
        }

        setSubmitting(true);

        try {
            const votesData = [{
                voter_id: voterId,
                candidate_id: selectedCandidateId,
                rank: 1,
            }];

            const { error: votesError } = await supabase
                .from('votes')
                .insert(votesData);

            if (votesError) throw votesError;

            // Mark voter as voted
            const { error: voterError } = await supabase
                .from('voters')
                .update({ has_voted: true, voted_at: new Date().toISOString() })
                .eq('id', voterId);

            if (voterError) throw voterError;

            // Redirect to results
            router.push('/results');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to submit your vote.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {step === 'login' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
                        <h1 className="text-3xl font-bold text-center mb-2 text-slate-950">Voting System</h1>
                        <p className="text-center text-slate-600 mb-8">Enter your details to begin.</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block font-bold mb-2 text-slate-950" htmlFor="voter-name">Full Name *</label>
                                <input
                                    id="voter-name"
                                    type="text"
                                    value={voterName}
                                    onChange={(e) => setVoterName(e.currentTarget.value)}
                                    required
                                    maxLength={120}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-950 bg-white"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-slate-950" htmlFor="voter-email">Email *</label>
                                <input
                                    id="voter-email"
                                    type="email"
                                    value={voterEmail}
                                    onChange={(e) => setVoterEmail(e.currentTarget.value)}
                                    required
                                    maxLength={160}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-950 bg-white"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-lg hover:bg-blue-700 transition"
                            >
                                Continue to Vote
                            </button>
                        </form>
                    </div>
                )}

                {step === 'vote' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
                        <h1 className="text-3xl font-bold text-center mb-2 text-slate-950">Select Your Candidate</h1>
                        <p className="text-center mb-8 text-slate-600">
                            Choose one candidate and submit your vote.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 mb-8">
                            {candidates.map((candidate) => (
                                <button
                                    type="button"
                                    key={candidate.id}
                                    className={`w-full text-left flex items-center gap-4 p-5 border rounded-lg transition ${
                                        selectedCandidateId === candidate.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 bg-white hover:border-blue-400'
                                    }`}
                                    onClick={() => handleCandidateSelect(candidate.id)}
                                >
                                    <input
                                        type="radio"
                                        name="candidate"
                                        checked={selectedCandidateId === candidate.id}
                                        onChange={() => handleCandidateSelect(candidate.id)}
                                        className="w-6 h-6 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-slate-950">{candidate.name}</h3>
                                        <p className="text-slate-600 font-medium">{candidate.position || 'Candidate'}</p>
                                    </div>
                                    {selectedCandidateId === candidate.id && (
                                        <div className="text-blue-600 font-bold">Selected</div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitVote}
                            disabled={submitting || !selectedCandidateId}
                            className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-xl hover:bg-blue-700 transition disabled:bg-slate-400"
                        >
                            {submitting ? 'Submitting Vote...' : 'Submit Vote'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
