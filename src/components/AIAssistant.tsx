"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState('');
  
  const isLoading = status === 'submitted' || status === 'streaming';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  // Scroll to bottom dynamically as the LLM streams tokens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleOpen = () => {
     setIsOpen(!isOpen);
     if (isOpen) setIsFullscreen(false); // Reset fullscreen if closing
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow"
          aria-label="Ask Pulse AI"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}

      {/* Floating Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-50 flex flex-col bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
              isFullscreen 
                ? "inset-4 rounded-3xl sm:inset-10" 
                : "bottom-6 right-6 w-[380px] h-[550px] rounded-2xl sm:bottom-8 sm:right-8"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center relative">
                   <Bot className="w-4 h-4 text-blue-400" />
                   {isLoading && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>}
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Pulse AI</h3>
                  <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Expert Consultant</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors hidden sm:block">
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={toggleOpen} className="p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-dark-bg/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">I am Pulse.</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-[250px]">
                    I know everything about Football, Cricket, and navigating the PulseSports platform.
                    Ask me what happened in that final!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-2">
                  {messages.map((m: any) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={m.id} 
                      className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'}`}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed relative ${m.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm' : 'bg-transparent border border-zinc-800/80 text-zinc-200 rounded-tl-sm'}`}>
                        {m.parts?.map((p: any, i: number) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
                      </div>
                    </motion.div>
                  ))}
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-4 rounded-xl text-center">
                      Connection error. Ensure your GOOGLE_GENERATIVE_AI_API_KEY is configured in .env.local
                    </div>
                  )}
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-2 items-center text-zinc-500 text-sm font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Pulse is thinking...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about a live proxy, player stats, or how to use the site..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 outline-none focus:border-blue-500 rounded-xl px-4 text-sm text-white placeholder:text-zinc-600 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
              <div className="text-center mt-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                 Powered by Gemini <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
