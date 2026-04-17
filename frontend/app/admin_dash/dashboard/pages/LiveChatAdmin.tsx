'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Trash2, Edit2, Settings, Users, MessageSquare, MoreVertical, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import apiAdmin from '@/lib/apiAdmin';

interface Conversation {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  lastMessage: string;
  lastMessageAt: string;
  isRead: boolean;
}

interface Message {
  _id: string;
  text: string;
  sender: string;
  senderModel: string;
  receiver?: string;
  receiverModel?: string;
  groupId?: string;
  isDeleted: boolean;
  createdAt: string;
}

export default function LiveChatAdmin() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('Select a user');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [globalChatEnabled, setGlobalChatEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    fetchSettings();
    fetchConversations();

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000';
    const newSocket = io(baseUrl, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected:', newSocket.id);
    });

    newSocket.on('receive_message', (msg: Message) => {
      if (
         activeChatRef.current && 
         (msg.sender === activeChatRef.current || msg.receiver === activeChatRef.current)
      ) {
         setMessages(prev => [...prev, msg]);
         scrollToBottom();
      }
      fetchConversations(); // Update side list
    });

    newSocket.on('message_deleted', (msgId: string) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m));
    });

    newSocket.on('full_chat_deleted', (deletedUserId: string) => {
      if (activeChatRef.current === deletedUserId) {
        setMessages([]);
      }
      fetchConversations();
    });

    newSocket.on('chat_status_changed', (data: { globalChatEnabled: boolean }) => {
      setGlobalChatEnabled(data.globalChatEnabled);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchSettings = async () => {
    try {
      const res = await apiAdmin.get('/api/messages/settings');
      setGlobalChatEnabled(res.data.globalChatEnabled);
    } catch (error) {
      console.error('Failed to fetch chat settings', error);
    }
  };

  const toggleSettings = async () => {
    try {
      const res = await apiAdmin.put('/api/messages/settings', { globalChatEnabled: !globalChatEnabled });
      setGlobalChatEnabled(res.data.settings.globalChatEnabled);
    } catch (error) {
      console.error('Failed to toggle settings', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await apiAdmin.get('/api/messages/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await apiAdmin.get(`/api/messages/history?userId=${userId}`);
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !socket) return;
    
    // We emit send_message, socket.io broadcast it back to us, so UI updates automatically
    socket.emit('send_message', { text: newMessage, receiverId: activeChat });
    setNewMessage('');
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!socket || !confirm("Delete this message for everyone?")) return;
    socket.emit('delete_message', msgId);
  };

  const handleDeleteFullChat = () => {
    if (!socket || !activeChat || !confirm("Are you sure you want to permanently delete ALL message history with this user? This cannot be undone.")) return;
    socket.emit('delete_full_chat', activeChat);
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4 lg:p-6 bg-gray-50/50">
      
      {/* Sidebar: Conversations */}
      <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-[#253A7B]" /> Live Chat
          </h2>
          <button 
             onClick={toggleSettings}
             title="Toggle Global Chat"
             className={`p-1.5 rounded-lg transition ${globalChatEnabled ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}
          >
             <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {filteredConversations.length === 0 ? (
             <div className="text-center p-6 text-gray-400 text-sm font-medium">No conversations found</div>
           ) : (
             filteredConversations.map(conv => (
               <button
                 key={conv.userId}
                 onClick={() => { setActiveChat(conv.userId); setActiveChatName(conv.name); }}
                 className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${activeChat === conv.userId ? 'bg-[#253A7B]/5 border border-[#253A7B]/10' : 'hover:bg-gray-50 border border-transparent'}`}
               >
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 flex-shrink-0 text-sm">
                   {conv.profilePicture ? (
                     <img src={conv.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                   ) : (
                     conv.name.charAt(0).toUpperCase()
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <h4 className="font-bold text-gray-900 text-sm truncate">{conv.name}</h4>
                       <span className="text-[10px] text-gray-400 whitespace-nowrap">
                         {new Date(conv.lastMessageAt).toLocaleDateString()}
                       </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                 </div>
               </button>
             ))
           )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
        {!globalChatEnabled && (
           <div className="absolute top-0 left-0 right-0 z-10 bg-red-500 text-white text-xs font-bold text-center py-1.5 shadow-sm">
             GLOBAL CHAT IS CURRENTLY DISABLED FOR USERS
           </div>
        )}
        
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 ${!globalChatEnabled ? 'mt-6' : ''}`}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#253A7B]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#253A7B]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{activeChatName}</h3>
                    <p className="text-xs text-gray-500">User ID: {activeChat}</p>
                  </div>
               </div>
               <button
                 onClick={handleDeleteFullChat}
                 title="Delete Complete Chat"
                 className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition rounded-lg flex items-center justify-center shadow-sm"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-4">
               {messages.length === 0 ? (
                 <div className="flex items-center justify-center flex-1 text-gray-400 font-medium">No messages yet. Say hi!</div>
               ) : (
                 messages.map(msg => {
                   const isAdmin = msg.senderModel === 'Admin';
                   return (
                     <div key={msg._id} className={`flex gap-2 max-w-[75%] group ${isAdmin ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        <div className="w-6 h-6 rounded-full bg-gray-200 mt-1 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {isAdmin ? 'A' : 'U'}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? 'bg-[#253A7B] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'} ${msg.isDeleted ? 'opacity-50 italic' : ''}`}>
                             {msg.text}
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] text-gray-400 font-medium ${isAdmin ? 'justify-end' : ''}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isAdmin && !msg.isDeleted && (
                              <button onClick={() => handleDeleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition">
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

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#253A7B]/20 transition shadow-sm">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 focus:outline-none text-sm"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition disabled:opacity-50 shadow-sm font-semibold"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
             <h3 className="text-xl font-bold text-gray-500">Live Chat Platform</h3>
             <p className="text-sm font-medium mt-1">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

    </div>
  );
}
