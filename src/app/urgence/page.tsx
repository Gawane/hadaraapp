'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { createIncident } from '@/lib/api';

export default function UrgencePage() {
  const [type, setType] = useState('MEDICAL');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function sendSOS() {
    setStatus('Localisation en cours…');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await createIncident({
            type,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            description,
          });
          setStatus('✅ Alerte envoyée. Une équipe a été notifiée.');
        } catch (err: any) {
          setStatus(`Erreur : ${err.message}. Connectez-vous pour envoyer une alerte.`);
        }
      },
      () => setStatus('Impossible de récupérer votre position. Autorisez la géolocalisation.'),
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-lg">
        <h1 className="text-2xl font-bold text-emerald-800 mb-1">Centre d'Urgence</h1>
        <p className="text-black/50 mb-6">Votre position GPS est transmise à l'équipe la plus proche.</p>

        <div className="bg-white border border-black/10 rounded-2xl p-6">
          <label className="block text-sm font-medium mb-1">Type d'incident</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm"
          >
            <option value="MEDICAL">Médical</option>
            <option value="SECURITY">Sécurité</option>
            <option value="LOST_CHILD">Enfant perdu</option>
            <option value="LOST_ITEM">Objet perdu</option>
          </select>

          <label className="block text-sm font-medium mb-1">Description (facultatif)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 mb-4 text-sm h-24"
          />

          <button onClick={sendSOS} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg">
            Envoyer l'alerte SOS
          </button>

          {status && <p className="text-sm mt-3 text-emerald-700">{status}</p>}
        </div>
      </main>
    </div>
  );
}
