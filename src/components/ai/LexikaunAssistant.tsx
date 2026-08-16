import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Content } from '@google/genai';
import { chatWithLexikaun } from '../../services/ai';
import { usePlanner } from '../../context/PlannerContext';
import { useHabits } from '../../context/HabitContext';
import { useMusic } from '../../context/MusicContext';

interface LexikaunAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LexikaunAssistant: React.FC<LexikaunAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Content[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { goals, currentTask, addGoal, scheduleTask } = usePlanner();
  const { addHabit } = useHabits();
  const { playBeat, beats } = useMusic();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', parts: [{ text: userText }] } as Content];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const contextData = { goals, currentTask };
      const response = await chatWithLexikaun(newMessages, userText, contextData);
      
      const responseContent = response.candidates?.[0]?.content;
      let finalResponseText = "Action completed.";

      if (responseContent) {
        // Handle tool calls
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const call of response.functionCalls) {
            await handleToolCall(call.name, call.args);
            finalResponseText = `Executed ${call.name} successfully.`;
          }
        }
        
        // Handle text response
        const textPart = responseContent.parts?.find(p => p.text);
        if (textPart && textPart.text) {
          finalResponseText = textPart.text;
        }

        setMessages((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: finalResponseText }] } as Content,
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: 'I encountered an error connecting to my core. Please check your API key.' }] } as Content,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToolCall = async (name: string, args: any) => {
    switch (name) {
      case 'createGoal':
        await addGoal({ title: args.title, category: args.category, timeframe: 'monthly' });
        break;
      case 'scheduleTask':
        await scheduleTask({
          title: args.title,
          startTime: args.startTime,
          endTime: args.endTime,
          date: args.date,
          status: 'pending',
          associatedGoalId: args.associatedGoalId,
        });
        break;
      case 'createHabit':
        await addHabit({
          name: args.name,
          frequency: args.frequency,
          preferredTime: args.preferredTime,
        });
        break;
      case 'playMusic':
        const match = beats.find(b => b.genre?.toLowerCase().includes(args.query.toLowerCase()) || b.title.toLowerCase().includes(args.query.toLowerCase()));
        if (match) playBeat(match);
        break;
      default:
        console.warn('Unknown tool:', name);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#27272a] bg-[#09090b]/95 backdrop-blur-3xl shadow-2xl transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-slate-100">ASK LEXIKAUN</h2>
            <p className="text-[10px] uppercase tracking-widest text-emerald-500/70">System Active</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 hover:bg-[#18181b] hover:text-slate-100 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
            <Sparkles className="h-8 w-8 text-emerald-500/30" />
            <p className="text-sm text-slate-400">
              I am Lexikaun. How can I optimize your workflow today?
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="rounded-full border border-[#27272a] bg-[#121214] px-3 py-1 text-xs text-slate-500">"Schedule gym at 6pm"</span>
              <span className="rounded-full border border-[#27272a] bg-[#121214] px-3 py-1 text-xs text-slate-500">"Create a new goal"</span>
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-black rounded-tr-sm'
                  : 'bg-[#121214] border border-[#27272a] text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.parts?.[0]?.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl rounded-tl-sm px-4 py-4 flex items-center space-x-1.5">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/50 [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/50 [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/50"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#27272a] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="w-full rounded-xl border border-[#27272a] bg-[#121214] py-3 pl-4 pr-12 text-sm text-slate-100 outline-none transition focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
