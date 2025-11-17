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
    const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
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
            const fp = getDeviceFingerprint();
            setDeviceFingerprint(fp);
        }
    }, []);
    const fetchCandidates = async () => {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .order('id');

        if (data) setCandidates(data);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(voterEmail)) {
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
            .select('*')
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
            .select('*')
            .eq('voter_email', voterEmail)
            .single();

        if (existingVoter?.has_voted) {
            setError('You have already voted with this email!');
            return;
        }

        // Create or update voter
        if (existingVoter) {
            // Update existing voter with device fingerprint
            await supabase
                .from('voters')
                .update({ device_fingerprint: deviceFingerprint })
                .eq('id', existingVoter.id);

            setVoterId(existingVoter.id);
        } else {
            // Create new voter with device fingerprint
            const { data: newVoter, error } = await supabase
                .from('voters')
                .insert([{
                    voter_name: voterName,
                    voter_email: voterEmail,
                    device_fingerprint: deviceFingerprint
                }])
                .select()
                .single();

            if (newVoter) setVoterId(newVoter.id);
        }

        setStep('vote');
    };

    const handleCheckboxChange = (candidateId: number) => {
        if (selectedCandidates.includes(candidateId)) {
            // Remove from selection
            setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
        } else {
            // Add to selection (limit to 1 candidate only)
            setSelectedCandidates([...selectedCandidates, candidateId]);
        }
    };

    const handleSubmitVote = async () => {
        setError('');

        // Check if at least one candidate is selected
        if (selectedCandidates.length === 0) {
            setError('Please select at least one candidate!');
            return;
        }

        setSubmitting(true);

        try {
            // Insert votes with sequential ranks
            const votesData = selectedCandidates.map((candidateId, index) => ({
                voter_id: voterId,
                candidate_id: candidateId,
                rank: index + 1, // Sequential ranks: 1, 2, 3, etc.
            }));

            const { error: votesError } = await supabase
                .from('votes')
                .insert(votesData);

            if (votesError) throw votesError;

            // Mark voter as voted
            await supabase
                .from('voters')
                .update({ has_voted: true, voted_at: new Date().toISOString() })
                .eq('id', voterId);

            // Redirect to results
            router.push('/results');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                {step === 'login' && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: '#000000' }}>Voting System</h1>
                        <p className="text-center text-gray-900 mb-8 font-semibold">Enter your details to vote</p>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block font-bold mb-2 text-lg" style={{ color: '#000000' }}>Full Name *</label>
                                <input
                                    type="text"
                                    value={voterName}
                                    onChange={(e) => setVoterName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-bold bg-white"
                                    style={{ color: '#000000' }}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-lg" style={{ color: '#000000' }}>Email *</label>
                                <input
                                    type="email"
                                    value={voterEmail}
                                    onChange={(e) => setVoterEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-bold bg-white"
                                    style={{ color: '#000000' }}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                            >
                                Continue to Vote
                            </button>
                        </form>
                    </div>
                )}

                {step === 'vote' && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: '#000000' }}>Select Your Candidate</h1>
                        <p className="text-center mb-8 font-semibold text-lg" style={{ color: '#000000' }}>
                            Check the box next to your preferred candidate
                        </p>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 mb-8">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className={`flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition ${
                                        selectedCandidates.includes(candidate.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                                    }`}
                                    onClick={() => handleCheckboxChange(candidate.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCandidates.includes(candidate.id)}
                                        onChange={() => handleCheckboxChange(candidate.id)}
                                        className="w-8 h-8 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-black" style={{ color: '#000000' }}>{candidate.name}</h3>
                                        <p className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{candidate.position}</p>
                                    </div>
                                    {selectedCandidates.includes(candidate.id) && (
                                        <div className="text-blue-600 font-bold text-xl">✓ Selected</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitVote}
                            disabled={submitting || selectedCandidates.length === 0}
                            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {submitting ? 'Submitting Vote...' : `Submit Vote${selectedCandidates.length > 0 ? ` (${selectedCandidates.length} selected)` : ''}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}