'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/guide', label: 'Smart Guide' },
  { href: '/urgence', label: "Centre d'Urgence" },
  { href: '/chatbot', label: 'Assistant Hadara' },
  { href: '/green', label: 'Green Hadara' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-emerald-950 text-cream p-6 min-h-screen">
      <div className="font-bold text-lg text-gold-300 mb-8">Hadara Smart City</div>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              pathname === link.href ? 'bg-emerald-600 text-gold-300' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
