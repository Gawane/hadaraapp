'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getEvents, getIncidents } from '@/lib/api';

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents().then(setEvents).catch((e) => setError(e.message));
    getIncidents().then(setIncidents).catch(() => {
      // silencieux si non authentifie / role insuffisant
    });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-1">Tableau de bord</h1>
        <p className="text-black/50 mb-6">Vue d'ensemble en temps réel</p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Événements ({events.length})</h2>
            <ul className="space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span>{e.title}</span>
                  <span className="text-black/40">{new Date(e.startAt).toLocaleString('fr-FR')}</span>
                </li>
              ))}
              {events.length === 0 && <li className="text-black/40">Aucun événement pour le moment.</li>}
            </ul>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Incidents ({incidents.length})</h2>
            <ul className="space-y-2 text-sm">
              {incidents.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.type}</span>
                  <span className="text-black/40">{i.status}</span>
                </li>
              ))}
              {incidents.length === 0 && (
                <li className="text-black/40">Connectez-vous avec un compte administrateur pour voir les incidents.</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
