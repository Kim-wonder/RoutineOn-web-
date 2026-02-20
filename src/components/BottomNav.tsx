'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 px-6 py-4 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: ROUTINE (formerly HOME) */}
        <Link
          href="/"
          className={`text-medium font-medium transition ${isActive('/') ? 'text-[#FF6B35]' : 'text-gray-400 hover:text-[#FF6B35]'
            }`}
        >
          ROUTINE
        </Link>

        {/* Tab 2: Add/Setup Icon (formerly ROUTINE text) */}
        <Link
          href="/setup"
          className="relative flex items-center justify-center -top-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-sm ${isActive('/setup')
            ? 'bg-[#FF6B35] text-white'
            : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </Link>

        {/* Tab 3: STATS */}
        <Link
          href="/stats"
          className={`text-medium font-medium transition ${isActive('/stats') ? 'text-[#FF6B35]' : 'text-gray-400 hover:text-black'
            }`}
        >
          STATS
        </Link>
      </div>
    </nav>
  );
}
