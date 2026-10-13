import React, { useState } from 'react';
import { useApp } from '../../store';
import { mockMessages } from '../../mockData';
import { Send, Paperclip, Search, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesTab: React.FC = () => {
  const { messages, currentUser } = useApp();
  const [activeChat, setActiveChat] = useState<string | null>('u2');
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>(messages.length > 0 ? messages : mockMessages);

  const chatMessages = localMessages.slice().sort((a, b) => {
    try {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } catch (e) {
      return 0;
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: 'm-' + Date.now(),
      senderId: currentUser?.id || 'u1',
      receiverId: activeChat || 'u2',
      content: newMessage.trim(),
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setLocalMessages(prev => [...prev, msg]);
    setNewMessage('');
    toast.success("Message sent");
  };

  const formatTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {}
    return timestampStr || 'Just now';
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 h-[calc(100vh-140px)] flex flex-col pb-4">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Direct Messages</h2>
        <p className="text-zinc-500 font-medium mt-1">Communicate directly with your prospective and checked-in guests.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden flex min-h-0">
        
        {/* Conversation List */}
        <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b border-zinc-100 bg-white">
            <div className="flex items-center gap-2 bg-zinc-100 rounded-xl px-3 py-2 text-zinc-500">
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="bg-transparent text-xs w-full outline-none text-zinc-900 font-medium" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {/* Conversation Item 1 */}
            <div 
              onClick={() => setActiveChat('u2')} 
              className={`p-4 cursor-pointer transition-colors flex gap-3.5 items-center ${
                activeChat === 'u2' ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-zinc-100/60'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-zinc-200 overflow-hidden border border-zinc-200">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150" alt="Sarah Connor" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-xs text-zinc-900 truncate">Sarah Connor</h4>
                  <span className="text-[10px] text-zinc-400 font-semibold">Active</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {chatMessages[chatMessages.length - 1]?.content || 'Can we do check-in tomorrow?'}
                </p>
              </div>
            </div>

            {/* Conversation Item 2 */}
            <div 
              onClick={() => setActiveChat('u3')} 
              className={`p-4 cursor-pointer transition-colors flex gap-3.5 items-center ${
                activeChat === 'u3' ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-zinc-100/60'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-zinc-200 overflow-hidden border border-zinc-200">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150" alt="Amit Patel" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-300 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-xs text-zinc-900 truncate">Amit Patel</h4>
                  <span className="text-[10px] text-zinc-400 font-semibold">Yesterday</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">Interested in renting for 3 months.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                <img 
                  src={activeChat === 'u2' 
                    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150" 
                    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150"} 
                  alt="Guest" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">
                  {activeChat === 'u2' ? 'Sarah Connor' : 'Amit Patel'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Circle size={6} fill="currentColor" /> Verified Guest
                </span>
              </div>
            </div>
            <div className="text-xs font-bold text-zinc-400">
              StayHub Direct Messenger
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/40">
            {chatMessages.map(msg => {
              const isMe = msg.senderId === (currentUser?.id || 'u1');
              return (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/10' 
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-xs shadow-xs'
                  }`}>
                    {msg.content || msg.text}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white border-t border-zinc-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message to the guest..." 
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
