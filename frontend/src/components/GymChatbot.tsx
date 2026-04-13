import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { Send, Loader2, ArrowLeft, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
};

function sanitizeMessage(text: string) {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(\r\n|\r)/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^-\s+/gm, '• ')
    .replace(/\s*\*\s*/g, '• ')
    .trim();
}

export default function GymChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi! I am your Max Fitness gym assistant. Ask me anything about workout plans, diet, recovery, or healthy food choices.' }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const response = await api.chatbot(trimmed);
      const assistantText = response.answer || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the gym assistant.');
      setMessages((prev) => [...prev, { role: 'assistant', text: 'I could not respond right now. Please try again.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    await handleSend();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Gym Chat</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Max Fitness Assistant</h1>
          <p className="mt-3 max-w-2xl text-zinc-400 leading-relaxed">
            Get answers only for gym workouts, training schedules, diet, nutrition, and healthy food advice while you train.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
          <div className="flex items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 px-5 py-4 mb-6">
            <div className="rounded-2xl bg-red-600/10 p-3 text-red-500">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Gym Assistant</p>
              <p className="text-sm text-zinc-500">Ask anything gym, workout, or diet related.</p>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={message.role === 'user' ? 'text-right' : 'text-left'}
              >
                <div className={message.role === 'user'
                  ? 'inline-block rounded-3xl rounded-tr-none bg-red-600/10 px-5 py-4 text-sm text-white' 
                  : 'inline-block rounded-3xl rounded-tl-none bg-zinc-900 px-5 py-4 text-sm text-zinc-300'}
                >
                  {sanitizeMessage(message.text)}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about workouts, diet, recovery..."
              className="min-w-0 flex-1 rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">What I can help with</h2>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li>• Workout plans for gym and home sessions</li>
            <li>• Monthly, quarterly, or yearly training guidance</li>
            <li>• Diet and meal timing for fitness goals</li>
            <li>• Healthy food choices before and after exercise</li>
            <li>• Recovery, rest days, and hydration tips</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
