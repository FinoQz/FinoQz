'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Loader2, MinusCircle, Phone, Mail, ArrowUpRight, Sparkles, MessageSquareText } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SupportActions {
  phone?: string;
  email?: string;
  contactPath?: string;
}

function parseSupportActions(content: string): SupportActions {
  const phoneMatch = content.match(/(?:\+?\d[\d\s-]{8,}\d)/);
  const emailMatch = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const contactPathMatch = content.match(/\(\s*(\/[^)\s]+)\s*\)|\b(\/landing\/pages\/contact)\b/i);

  return {
    phone: phoneMatch?.[0]?.trim(),
    email: emailMatch?.[0]?.trim(),
    contactPath: (contactPathMatch?.[1] || contactPathMatch?.[2])?.trim(),
  };
}

function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s|-/g, '')}`;
}

function cleanupSupportText(content: string): string {
  return content
    .replace(/\*\s*\*\*Helpline Number\*\*\s*:\s*[^\n]+/gi, '')
    .replace(/\*\s*\*\*Support Email\*\*\s*:\s*[^\n]+/gi, '')
    .replace(/\*\s*\*\*Contact Page\*\*\s*:\s*[^\n]+/gi, '')
    .replace(/\*\*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Finoqz.AI. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
      const res = await apiAdmin.post('api/public/chat', { messages: history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting. Contact support@finoqz.com." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderAssistantContent = (content: string) => {
    const actions = parseSupportActions(content);
    const hasActions = Boolean(actions.phone || actions.email || actions.contactPath);
    const cleanText = hasActions ? cleanupSupportText(content) : content;

    return (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-gray-600 leading-normal">{cleanText}</p>
        {hasActions && (
          <div className="flex flex-col gap-1 mt-2">
            {actions.phone && (
              <a href={toTelHref(actions.phone)} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-bold text-[#253A7B] hover:bg-[#253A7B] hover:text-white transition-all">
                <span>Call Helpline</span>
                <Phone className="w-2.5 h-2.5" />
              </a>
            )}
            {actions.email && (
              <a href={`mailto:${actions.email}`} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-bold text-[#253A7B] hover:bg-[#253A7B] hover:text-white transition-all">
                <span>Email Support</span>
                <Mail className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="mb-4 w-[290px] h-[430px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ring-1 ring-black/5"
          >
            {/* Minimal Elegant Header */}
            <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#253A7B]" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-800 tracking-tight">Finoqz AI</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Expert</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-gray-50 rounded-lg transition-all text-gray-400 hover:text-gray-600">
                  <MinusCircle className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-50 rounded-lg transition-all text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Elegant Message Canvas */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth bg-white custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-[11px] font-medium leading-relaxed tracking-wide ${
                    m.role === 'user' 
                      ? 'bg-[#253A7B] text-white rounded-tr-none shadow-sm shadow-blue-900/10' 
                      : 'bg-[#F8F9FB] text-gray-600 border border-gray-100 rounded-tl-none'
                  }`}>
                    {m.role === 'assistant' ? renderAssistantContent(m.content) : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="px-4 py-2 bg-[#F8F9FB] rounded-2xl rounded-tl-none border border-gray-50">
                     <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                   </div>
                </div>
              )}
            </div>

            {/* Discreet Input Dock */}
            <div className="px-5 py-4 border-t border-gray-50 bg-white">
              <div className="flex items-center gap-2 bg-[#F8F9FB] rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-100 transition-all">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-[11px] font-medium text-gray-800 outline-none placeholder:text-gray-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-[#253A7B] text-white p-1.5 rounded-lg hover:scale-105 transition-all disabled:opacity-30"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-xl flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all"
            onClick={() => setIsMinimized(false)}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#253A7B]" />
            <span className="text-[10px] font-bold text-gray-800 tracking-tight">AI Assistant</span>
            <X className="w-3 h-3 text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && !isMinimized && (
        <div className="relative group cursor-grab active:cursor-grabbing">
          {/* Subtle helper text for mobile */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.5, 1] }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none md:hidden"
          >
            Swipe to Hide
          </motion.p>
          
          <motion.button
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, info) => {
              // If dragged more than 100px to the right, dismiss
              if (info.offset.x > 80 || info.offset.x < -80) {
                setIsDismissed(true);
              }
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative w-11 h-11 bg-[#253A7B] rounded-full shadow-[0_10px_25px_rgba(37,58,123,0.3)] flex items-center justify-center group ring-4 ring-blue-50/50 border border-white/10"
          >
            <div className="relative z-10 flex items-center justify-center pointer-events-none">
               <motion.div
                 animate={{ 
                   y: [0, -4, 0],
                   scale: [1, 1.1, 1],
                   rotate: [0, 4, -4, 0] 
                 }}
                 transition={{ 
                   repeat: Infinity, 
                   duration: 4,
                   ease: "easeInOut" 
                 }}
               >
                  <Bot className="w-5 h-5 text-white" />
               </motion.div>
               <motion.div
                 animate={{ 
                   opacity: [0.4, 0.9, 0.4],
                   scale: [0.8, 1.3, 0.8],
                   rotate: [0, 45, 90, 135, 180] 
                 }}
                 transition={{ 
                   repeat: Infinity, 
                   duration: 5,
                   ease: "linear" 
                 }}
                 className="absolute -top-1 -right-1"
               >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
               </motion.div>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}
