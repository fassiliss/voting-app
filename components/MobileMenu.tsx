'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white p-2"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-20 left-0 right-0 bg-slate-900 shadow-lg z-50">
                    <nav className="flex flex-col p-4 space-y-4">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="text-white font-bold py-2 px-4 rounded hover:bg-slate-800"
                        >
                            Vote
                        </Link>
                        <Link
                            href="/results"
                            onClick={() => setIsOpen(false)}
                            className="text-white font-bold py-2 px-4 rounded hover:bg-slate-800"
                        >
                            Results
                        </Link>
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="text-white font-bold py-2 px-4 rounded hover:bg-slate-800"
                        >
                            QR Code
                        </Link>
                        <Link
                            href="/admin/manage"
                            onClick={() => setIsOpen(false)}
                            className="text-white font-bold py-2 px-4 rounded hover:bg-slate-800"
                        >
                            Manage Candidates
                        </Link>
                    </nav>
                </div>
            )}
        </div>
    );
}
