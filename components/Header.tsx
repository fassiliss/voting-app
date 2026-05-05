import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';

export default function Header() {
    return (
        <header className="bg-slate-950 text-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <div className="bg-white rounded-full p-1">
                            <Image
                                src="/logo.png"
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
                            className="font-bold hover:text-blue-200 transition"
                        >
                            QR Code
                        </Link>
                        <Link
                            href="/admin/manage"
                            className="bg-white text-slate-950 px-4 py-2 rounded-md font-bold hover:bg-slate-100 transition"
                        >
                            Manage
                        </Link>
                    </nav>

                    {/* Mobile Menu */}
                    <MobileMenu />
                </div>
            </div>
        </header>
    );
}
