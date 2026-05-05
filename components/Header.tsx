import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="app-header text-white shadow-sm">
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
                            className="nav-cta"
                        >
                            Manage
                        </Link>
                        <ThemeToggle />
                    </nav>

                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <MobileMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}
