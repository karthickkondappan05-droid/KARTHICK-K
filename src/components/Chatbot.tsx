import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageSquare, X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { Listing } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot({ listings }: { listings: Listing[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm your AI housing assistant. Tell me what kind of house you're looking for, e.g., 'Find me a cheap house in Madurai.'"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      // Create a context string from available listings
      const listingsContext = listings.map(l => 
        `- ₹${l.price}/mo, ${l.bhk}BHK ${l.houseType} in ${l.location}, ${l.district}. Amenities: ${l.amenities.join(', ')}`
      ).join('\n');

      const prompt = `You are a helpful real estate assistant. I am looking for a house in Tamil Nadu.
Here are the available rental properties in our database:
${listingsContext}

The user says: "${userMsg}"
Recommend the best matches from the database based on their request. Keep the response friendly, concise, and highlight why it matches. If nothing matches perfectly, suggest the closest options.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: response.text || "I'm sorry, I couldn't process that request." 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "Oops! I'm having trouble connecting to my AI brain right now." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white z-50 flex items-center justify-center transition-transform hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[80vh] z-50 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">AI Agent</h3>
                  <p className="text-[10px] text-blue-100 flex items-center gap-1"><Sparkles className="w-3 h-3"/>Powered by Gemini</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white shadow-sm border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <Input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="pr-12 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 top-1 bottom-1 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
