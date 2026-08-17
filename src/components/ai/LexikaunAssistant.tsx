import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Content } from '@google/genai';
import { chatWithLexikaun } from '../../services/ai';
import { usePlanner } from '../../context/PlannerContext';
import { useHabits } from '../../context/HabitContext';
import { useMusic } from '../../context/MusicContext';
import { FloatingPanel } from '../ui/FloatingPanel';

interface LexikaunAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const LexikaunAssistant: React.FC<LexikaunAssistantProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
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

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleAutoSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleAutoSend = async (promptText: string) => {
    const newMessages = [
      ...messages,
      { role: 'user', parts: [{ text: promptText }] } as Content,
    ];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const contextData = { goals, currentTask };
      const response = await chatWithLexikaun(newMessages, promptText, contextData);

      const responseContent = response.candidates?.[0]?.content;
      let finalResponseText = 'Ritual action completed.';

      if (responseContent) {
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const call of response.functionCalls) {
            await handleToolCall(call.name, call.args);
            finalResponseText = `Executed ${call.name} successfully.`;
          }
        }

        const textPart = responseContent.parts?.find((p) => p.text);
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
        {
          role: 'model',
          parts: [
            {
              text: 'I encountered an error connecting to my core. Please verify your connection or API configuration.',
            },
          ],
        } as Content,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    const newMessages = [
      ...messages,
      { role: 'user', parts: [{ text: userText }] } as Content,
    ];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const contextData = { goals, currentTask };
      const response = await chatWithLexikaun(newMessages, userText, contextData);

      const responseContent = response.candidates?.[0]?.content;
      let finalResponseText = 'Action completed.';

      if (responseContent) {
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const call of response.functionCalls) {
            await handleToolCall(call.name, call.args);
            finalResponseText = `Executed ${call.name} successfully.`;
          }
        }

        const textPart = responseContent.parts?.find((p) => p.text);
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
        {
          role: 'model',
          parts: [
            {
              text: 'I encountered an error connecting to my core. Please verify your connection or API configuration.',
            },
          ],
        } as Content,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToolCall = async (name: string, args: any) => {
    switch (name) {
      case 'createGoal':
        await addGoal({
          title: args.title,
          category: args.category,
          timeframe: 'monthly',
        });
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
        const match = beats.find(
          (b) =>
            b.genre?.toLowerCase().includes(args.query.toLowerCase()) ||
            b.title.toLowerCase().includes(args.query.toLowerCase())
        );
        if (match) playBeat(match);
        break;
      default:
        console.warn('Unknown tool:', name);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-hairline bg-[#1E1C22]/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] transition-transform duration-200 animate-in slide-in-from-right select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5 bg-surface/40">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent/15 text-accent border border-accent/30">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="font-display text-xs font-medium tracking-wider uppercase text-ink">
              Ask Lexikaun
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-widest text-accent">
              Global Rituals & AI Assistant
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-muted hover:bg-surface hover:text-ink transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-3 p-4">
            <div className="w-10 h-10 rounded-2xl bg-surface border border-hairline flex items-center justify-center text-accent shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm text-ink font-normal">
              How can I assist your workflow?
            </h3>
            <p className="text-[11px] text-ink-muted max-w-xs">
              Review tasks across all domains, manage music sessions, or run your daily planning and shutdown rituals.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-canvas font-medium rounded-tr-sm shadow-sm'
                  : 'bg-surface border border-hairline text-ink rounded-tl-sm shadow-sm'
              }`}
            >
              {msg.parts?.[0]?.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-hairline rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center space-x-1.5 shadow-sm">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60 [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60 [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-hairline p-3.5 bg-surface/30">
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
            placeholder="Ask Lexikaun or run a ritual command..."
            className="w-full rounded-[10px] border border-hairline bg-surface py-2.5 pl-3.5 pr-10 text-xs text-ink outline-none transition focus:border-accent/60 font-sans placeholder:text-ink-muted/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent text-canvas transition hover:bg-accent/90 disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
