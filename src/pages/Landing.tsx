import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ConfirmationCard, ConfirmationTier } from '../components/ui/ConfirmationCard';
import { Send, Sparkles, CheckCircle2 } from 'lucide-react';

interface MockMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confirmation?: {
    tier: ConfirmationTier;
    actionDescription: string;
  };
}

export const Landing: React.FC = () => {
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Good morning. I'm your single assistant across Professional, Music, and Personal. What are we focusing on today?",
      timestamp: '09:00 AM'
    },
    {
      id: '2',
      sender: 'user',
      text: "Schedule 2 hours for mixing Beat 140 'Nightfall' this afternoon, and check my meditation habit streak.",
      timestamp: '09:01 AM'
    },
    {
      id: '3',
      sender: 'assistant',
      text: "I've checked your routine: Meditation is currently on a 5-day streak! I'm ready to schedule 'Nightfall Mixing' for 2:00 PM – 4:00 PM today.",
      timestamp: '09:01 AM',
      confirmation: {
        tier: 'inline',
        actionDescription: "Schedule 'Nightfall Mixing' (Professional) for Today 2:00 PM - 4:00 PM"
      }
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [confirmedActions, setConfirmedActions] = useState<string[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: MockMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputVal,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I've processed your request across your workspace data. (Mock Response in Phase 1 shell)",
          timestamp: 'Just now'
        }
      ]);
    }, 600);
  };

  const samplePrompts = [
    "What's on my schedule today?",
    "Block 2 hours for Beat 140 mixing at 2pm",
    "Show my 7-day meditation habit streak",
    "Review EP 2026 goal progress"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium tracking-tight text-text-main">Assistant</h1>
        <p className="text-xs text-text-secondary mt-1">
          One unified chatbot with full tool access across Personal, Professional, and Music.
        </p>
      </div>

      {/* Messages Flow */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3.5 text-sm font-normal ${
                msg.sender === 'user'
                  ? 'bg-surface hairline-border text-text-main'
                  : 'bg-bg-main hairline-border text-text-main'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 opacity-60 text-xs text-text-secondary">
                {msg.sender === 'assistant' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-red-main" />
                    <span>Lexikaun AI</span>
                  </>
                ) : (
                  <span>You</span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              
              <p className="leading-relaxed">{msg.text}</p>

              {/* Tiered Confirmation Demo */}
              {msg.confirmation && !confirmedActions.includes(msg.id) && (
                <div className="mt-3 pt-2 border-t border-border-main">
                  <ConfirmationCard
                    tier={msg.confirmation.tier}
                    message={msg.confirmation.actionDescription}
                    onConfirm={() => setConfirmedActions(prev => [...prev, msg.id])}
                    onCancel={() => setConfirmedActions(prev => [...prev, msg.id])}
                  />
                </div>
              )}

              {msg.confirmation && confirmedActions.includes(msg.id) && (
                <div className="mt-2 text-xs text-text-secondary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-text-main" />
                  <span>Action verified & scheduled</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputVal(prompt)}
            className="text-xs px-2.5 py-1 rounded-full bg-surface hairline-border hover:border-text-secondary text-text-secondary hover:text-text-main transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask anything, plan tasks, schedule beats, or check habits..."
          className="w-full bg-surface hairline-border rounded-lg pl-4 pr-12 py-2.5 text-sm font-normal text-text-main placeholder:text-text-secondary focus:outline-none focus:border-text-secondary transition-colors"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="absolute right-2.5 p-1.5 rounded-md bg-red-main text-white hover:bg-opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
