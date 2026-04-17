'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import apiUser from '@/lib/apiUser';

interface Message {
  _id: string;
  text: string;
  sender: string;
  senderModel: string;
  isDeleted: boolean;
  createdAt: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (enabled && isOpen && !socket) {
      initChat();
    }
  }, [enabled, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const fetchSettings = async () => {
    try {
      const res = await apiUser.get('/api/messages/settings');
      setEnabled(res.data.globalChatEnabled);
    } catch (err) {
      console.warn("Could not fetch chat settings");
    }
  };

  const initChat = async () => {
    try {
      // Fetch history first
      const hist = await apiUser.get('/api/messages/history');
      setMessages(hist.data.messages || []);

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000';
      const newSocket = io(baseUrl, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('User socket connected');
      });

      newSocket.on('receive_message', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });

      newSocket.on('message_deleted', (msgId: string) => {
        setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m));
      });

      newSocket.on('chat_status_changed', (data: { globalChatEnabled: boolean }) => {
        setEnabled(data.globalChatEnabled);
        if(!data.globalChatEnabled) setIsOpen(false);
      });

      setSocket(newSocket);
      
    } catch (err) {
      console.error('Failed to init live chat', err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    // Send direct to Admin 
    // Usually we don't supply receiverId since server assumes it's meant for admin if missing receiverId
    socket.emit('send_message', { text: newMessage, receiverId: null, groupId: null });
    setNewMessage('');
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!socket || !confirm("Delete this message?")) return;
    socket.emit('delete_message', msgId);
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#253A7B] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Support Chat</h3>
                <p className="text-[10px] text-blue-200">Usually replies in a few minutes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Start a conversation</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderModel === 'User';
                return (
                  <div key={msg._id} className={`flex max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} gap-2`}>
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600 mt-auto mb-1">
                      {isMe ? 'U' : 'A'}
                    </div>
                    <div className="flex flex-col gap-1 w-full group/msg">
                      <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        isMe ? 'bg-[#253A7B] text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                      } ${msg.isDeleted ? 'italic opacity-50' : ''}`}>
                        {msg.text}
                      </div>   
                      <div className={`flex items-center gap-2 text-[9px] text-gray-400 font-medium px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && !msg.isDeleted && (
                          <button onClick={() => handleDeleteMessage(msg._id)} className="opacity-0 group-hover/msg:opacity-100 text-red-500 hover:text-red-700 transition">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-[#253A7B]/20 transition">
              <input 
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition disabled:opacity-30 disabled:bg-gray-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#253A7B] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#1a2a5e] hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

    </div>
  );
}
