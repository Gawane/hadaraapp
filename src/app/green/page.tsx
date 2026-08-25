'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getWasteLeaderboard, uploadImage, createWasteReport } from '@/lib/api';

export default function GreenPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [neighborhood, setNeighborhood] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getWasteLeaderboard().then(setLeaderboard).catch(() => {});
  }, []);

  async function submitReport() {
    if (!file) {
      setStatus('Ajoutez une photo avant d\u2019envoyer.');
      return;
    }
    setSubmitting(true);
    setStatus('Envoi de la photo…');
    try {
      const { url } = await uploadImage(file);
      setStatus('Localisation en cours…');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await createWasteReport({
              photoUrl: url,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              neighborhood: neighborhood || undefined,
            });
            setStatus('✅ Signalement envoyé — merci pour votre contribution !');
            setFile(null);
            getWasteLeaderboard().then(setLeaderboard).catch(() => {});
          } catch (err: any) {
            setStatus(`Erreur : ${err.message}`);
          } finally {
            setSubmitting(false);
          }
        },
        () => {
          setStatus('Impossible de récupérer votre position. Autorisez la géolocalisation.');
          setSubmitting(false);
        },
      );
    } catch (err: any) {
      setStatus(`Erreur : ${err.message}`);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-1">Green Hadara</h1>
        <p className="text-black/50 mb-6">Signalement participatif et classement des quartiers — données réelles</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Signaler une zone sale</h2>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm mb-3 block"
            />
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Quartier (facultatif)"
              className="w-full border border-black/10 rounded-lg px-3 py-2 mb-3 text-sm"
            />
            <button
              onClick={submitReport}
              disabled={submitting}
              className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : 'Envoyer le signalement'}
            </button>
            {status && <p className="text-sm mt-3 text-emerald-700">{status}</p>}
            <p className="text-xs text-black/40 mt-2">
              La photo est envoyée vers Cloudinary via l'API, puis analysée pour prioriser l'intervention.
            </p>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Classement des quartiers</h2>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              {leaderboard.map((n) => (
                <li key={n.neighborhood}>
                  {n.neighborhood} — <span className="font-mono">{n.reportsResolved} signalements</span>
                </li>
              ))}
              {leaderboard.length === 0 && <li className="text-black/40 list-none">Aucune donnée pour le moment.</li>}
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
