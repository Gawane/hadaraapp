'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getLocations } from '@/lib/api';

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

declare global {
  interface Window {
    L?: any;
  }
}

// Charge Leaflet une seule fois par session, même si plusieurs composants
// montent/démontent la carte. Evite d'importer le paquet npm "leaflet"
// (source de l'erreur "module introuvable" lors du build Next.js) en le
// chargeant directement depuis le CDN, comme un script classique.
let leafletLoadingPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Echec de chargement de Leaflet.')));
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Echec de chargement de Leaflet.'));
    document.body.appendChild(script);
  });

  return leafletLoadingPromise;
}

export default function GuidePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => {});
  }, []);

  // Initialise la carte UNE seule fois, indépendamment des données, pour
  // éviter de recréer/détruire l'instance Leaflet à chaque fetch.
  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const hadaraIcon = L.icon({
          iconUrl: '/leaflet/marker-icon.svg',
          shadowUrl: '/leaflet/marker-shadow.svg',
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          shadowSize: [36, 18],
          shadowAnchor: [18, 9],
          popupAnchor: [0, -36],
        });

        const map = L.map(containerRef.current).setView([15.8814, -16.8129], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(map);

        mapRef.current = map;
        mapRef.current._hadaraIcon = hadaraIcon;
        mapRef.current._L = L;

        syncMarkers();
      })
      .catch((err) => setMapError(err.message));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ajoute/rafraîchit les marqueurs à chaque changement de données, sans
  // jamais recréer la carte elle-même.
  useEffect(() => {
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  function syncMarkers() {
    const map = mapRef.current;
    if (!map || locations.length === 0) return;

    const L = map._L;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const marker = L.marker([loc.latitude, loc.longitude], { icon: map._hadaraIcon })
        .addTo(map)
        .bindPopup(loc.name);
      markersRef.current.push(marker);
    });

    map.setView([locations[0].latitude, locations[0].longitude], map.getZoom());
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-1">Smart Guide</h1>
        <p className="text-black/50 mb-6">Carte intelligente de Tivaouane — données en direct depuis l'API</p>
        {mapError && (
          <p className="text-sm text-red-600 mb-3">
            La carte n'a pas pu se charger ({mapError}). Vérifiez votre connexion internet.
          </p>
        )}
        <div ref={containerRef} className="h-[520px] rounded-2xl border border-black/10" />
      </main>
    </div>
  );
}
