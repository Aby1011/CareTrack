import { useState, useEffect, useRef } from 'react'
import { Send, User, Clock } from 'lucide-react'
import { messages, addMessage, markMessagesAsRead } from '../data/mockData'

function ChatWindow({ currentUser, otherUser, patientId }) {
  const [inputText, setInputText] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatMessages = () => {
    const filtered = messages.filter(m => 
      (m.fromId === currentUser.id && m.toId === otherUser.id) ||
      (m.fromId === otherUser.id && m.toId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    setChatMessages(filtered)
    
    // Mark as read when messages are loaded/viewed
    markMessagesAsRead(currentUser.id, otherUser.id)
  }

  useEffect(() => {
    loadChatMessages()
    
    // Set up interval for "real-time" feel in this mock system
    const interval = setInterval(loadChatMessages, 3000)
    
    // Also listen for storage events (cross-tab)
    window.addEventListener('storage', loadChatMessages)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', loadChatMessages)
    }
  }, [otherUser.id, currentUser.id])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    addMessage({
      from: currentUser.name,
      fromId: currentUser.id,
      to: otherUser.name,
      toId: otherUser.id,
      patientId: patientId || (currentUser.role === 'patient' ? currentUser.id : otherUser.id),
      subject: 'Message',
      message: inputText.trim()
    })

    setInputText('')
    loadChatMessages()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full bg-white shadow-sm" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight">{otherUser.name}</h4>
            <p className="text-xs text-slate-500 capitalize">{otherUser.role}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <User className="w-12 h-12 opacity-20" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.fromId === currentUser.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
                    isMe 
                      ? 'bg-primary-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
