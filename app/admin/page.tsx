'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminQRPage() {
    const { isAuthenticated, isChecking } = useAdminAuth();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [votingUrl, setVotingUrl] = useState('');

    const generateQRCode = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const timer = window.setTimeout(() => {
            generateQRCode();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [generateQRCode, isAuthenticated]);

    if (isChecking || !isAuthenticated) {
        return (
            <div className="min-h-screen app-page flex items-center justify-center">
                <div className="text-2xl font-bold app-heading">Checking access...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-page py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="app-panel rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-2 app-heading">
                        Voting QR Code
                    </h1>
                    <p className="text-center app-muted mb-8">
                        Scan this QR code to open the voting page.
                    </p>

                    {qrCodeUrl && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="app-panel p-6 rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrCodeUrl} alt="Voting QR Code" className="w-full max-w-md" />
                            </div>

                            <div className="text-center">
                                <p className="text-sm app-muted mb-2">Or use this link:</p>
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
                     className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    Generate New QR Code
                </button>

                <button
                    onClick={() => window.print()}
                    className="bg-slate-900 text-white px-6 py-3 rounded-md font-semibold hover:bg-slate-700 transition"
                >
                    Print QR Code
                </button>
            </div>
            )}
        </div>
</div>
</div>
);
}
