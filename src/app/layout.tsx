import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hadara Smart City',
  description: 'Plateforme numérique pour les grands rassemblements religieux au Sénégal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
