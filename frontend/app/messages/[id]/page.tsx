'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { messagesAPI } from '@/lib/api';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const convoId = Number(id);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');

  const refresh = () => messagesAPI.getConversation(convoId).then(r => setMessages(r.data.messages));
  useEffect(() => { if (convoId) refresh(); }, [convoId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await messagesAPI.sendToConversation(convoId, body);
    setBody('');
    refresh();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conversation</h1>
      <div className="border rounded-lg bg-white p-4 space-y-2 mb-4 h-96 overflow-y-auto">
        {messages.map(m => (
          <div key={m.id} className="border-b pb-2">
            <p className="text-sm">{m.body}</p>
            {m.flagged && <p className="text-xs text-amber-600">⚠ Contact info removed for safety</p>}
            <p className="text-xs text-neutral-500">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..." className="input-field flex-1" />
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  );
}
