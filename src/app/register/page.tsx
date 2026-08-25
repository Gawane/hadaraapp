'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register, setTokens } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({ fullName, email, phone: phone || undefined, password });
      setTokens(res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-emerald-800 mb-6">Créer un compte visiteur</h1>

        <label className="block text-sm font-medium mb-1">Nom complet</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-sm font-medium mb-1">Téléphone (facultatif, pour SMS/WhatsApp)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+221 7X XXX XX XX"
          className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm font-medium mb-1">Mot de passe (8 caractères min.)</label>
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>

        <p className="text-sm text-center text-black/50 mt-4">
          Déjà inscrit ? <Link href="/login" className="text-emerald-700 font-semibold">Se connecter</Link>
        </p>
      </form>
    </main>
  );
}
