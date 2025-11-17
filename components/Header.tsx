import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';

export default function Header() {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <div className="bg-white rounded-full p-1">
                            <Image
                                src="/grace-logo.png"
                                alt="Grace Church Logo"
                                width={60}
                                height={60}
                                className="rounded-full"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black">iVoteForIt</h1>
                            <p className="text-xs md:text-sm font-semibold text-blue-100">Secure Digital Voting</p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="font-bold hover:text-blue-200 transition"
                        >
                            Vote
                        </Link>
                        <Link
                            href="/results"
                            className="font-bold hover:text-blue-200 transition"
                        >
                            Results
                        </Link>
                        <Link
                            href="/admin"
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition"
                        >
                            Admin
                        </Link>
                    </nav>

                    {/* Mobile Menu */}
                    <MobileMenu />
                </div>
            </div>
        </header>
    );
}