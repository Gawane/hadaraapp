import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold text-emerald-800 mb-3">Hadara Smart City</h1>
      <p className="text-black/60 max-w-md mb-8">
        Plateforme numérique intelligente pour l'organisation des grands rassemblements religieux à Tivaouane.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold">
          Se connecter
        </Link>
        <Link href="/guide" className="bg-sand px-5 py-2.5 rounded-lg font-semibold">
          Explorer la carte
        </Link>
      </div>
    </main>
  );
}
