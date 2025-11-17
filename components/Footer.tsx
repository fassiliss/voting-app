import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white rounded-full p-1">
                                <Image
                                    src="/grace-logo.png"
                                    alt="Grace Church Logo"
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                            </div>
                            <h3 className="text-2xl font-black">iVoteForIt</h3>
                        </div>
                        <p className="text-gray-400 font-semibold">
                            Secure, transparent, and easy digital voting platform.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-white font-semibold transition">
                                    Vote Now
                                </Link>
                            </li>
                            <li>
                                <Link href="/results" className="text-gray-400 hover:text-white font-semibold transition">
                                    View Results
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-gray-400 hover:text-white font-semibold transition">
                                    QR Code Generator
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/manage" className="text-gray-400 hover:text-white font-semibold transition">
                                    Manage Candidates
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Features</h4>
                        <ul className="space-y-2 text-gray-400 font-semibold">
                            <li>✅ Device fingerprinting</li>
                            <li>✅ Email validation</li>
                            <li>✅ QR code voting</li>
                            <li>✅ Real-time results</li>
                            <li>✅ Secure & transparent</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 font-semibold">
                        © {currentYear} iVoteForIt. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Developed by www.fassiltsegaye.com & ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}