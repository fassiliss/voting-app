'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminQRPage() {
    useAdminAuth();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [votingUrl, setVotingUrl] = useState('');

    useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        // Generate unique session ID
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);

        // Create voting URL with session
        // Use current domain (works for both localhost and production)
        const url = `${window.location.origin}?session=${sessionId}`;
        setVotingUrl(url);

        // Generate QR code
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            setQrCodeUrl(qrDataUrl);
        } catch (err) {
            console.error('Error generating QR code:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-4xl font-bold text-center mb-2 text-black">
                        Voting QR Code
                    </h1>
                    <p className="text-center text-gray-700 mb-8 font-semibold">
                        Scan this QR code to vote
                    </p>

                    {qrCodeUrl && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="bg-white p-6 rounded-lg border-4 border-blue-500">
                                <img src={qrCodeUrl} alt="Voting QR Code" className="w-full max-w-md" />
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Or use this link:</p>
                                <a
                                href={votingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-semibold hover:underline break-all"
                                >
                                {votingUrl}
                            </a>
                        </div>

                        <button
                        onClick={generateQRCode}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Generate New QR Code
                </button>

                <button
                    onClick={() => window.print()}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                    🖨️ Print QR Code
                </button>
            </div>
            )}
        </div>
</div>
</div>
);
}