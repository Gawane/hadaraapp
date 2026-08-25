'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { askChatbot } from '@/lib/api';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function ChatbotPage() {
  const [language, setLanguage] = useState<'fr' | 'wo' | 'ar'>('fr');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Salam aleikum ! Posez-moi une question sur les événements, les lieux ou l'histoire de Tivaouane." },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const question = input;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await askChatbot(question, language);
      setMessages((m) => [...m, { role: 'bot', text: res.answer }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'bot', text: `Erreur : ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-1">Assistant Hadara</h1>
        <p className="text-black/50 mb-6">Connecté à l'API — OpenAI si NEXT_PUBLIC_API_URL pointe vers un backend avec OPENAI_API_KEY configurée.</p>

        <div className="max-w-xl bg-white border border-black/10 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-black/10 flex gap-2">
            {(['fr', 'wo', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  language === l ? 'bg-emerald-800 text-gold-300' : 'bg-sand'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3 h-80 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                  m.role === 'user' ? 'bg-emerald-600 text-white ml-auto' : 'bg-sand'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-black/40">L'assistant répond…</div>}
          </div>

          <div className="p-3 border-t border-black/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Où se trouve la Grande Mosquée ?"
              className="flex-1 border border-black/10 rounded-full px-4 py-2 text-sm"
            />
            <button onClick={send} className="bg-emerald-600 text-white text-sm px-4 rounded-full">
              Envoyer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
