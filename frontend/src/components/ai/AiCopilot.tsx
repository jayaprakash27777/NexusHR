import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BrainCircuit, X, MessageSquare, Send } from 'lucide-react'

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; widget?: 'ATTRITION' | 'PAYROLL' | null }[]>([
    { role: 'ai', text: 'Hi! I am your Workforce AI Copilot. How can I assist you today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    // Simulate AI response processing
    setTimeout(() => {
      setIsTyping(false)
      
      const lower = userMsg.toLowerCase()
      if (lower.includes('attrition') || lower.includes('risk')) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'I\'ve analyzed the current workforce data. The engineering department shows a slight elevated risk due to recent compensation market shifts.',
          widget: 'ATTRITION'
        }])
      } else if (lower.includes('payroll') || lower.includes('salary')) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'Here is a quick summary of the payroll forecast for next quarter.',
          widget: 'PAYROLL'
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'I can help you analyze attrition risks, generate payroll summaries, or review attendance patterns. What would you like to explore?'
        }])
      }
    }, 1500)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-transform hover:scale-110 active:scale-95"
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.5 }}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </motion.button>

      {/* Copilot Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-nexus-950/90 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-accent-indigo" />
              <span className="font-semibold text-nexus-50">AI Copilot</span>
              <span className="rounded-full bg-accent-indigo/20 px-2 py-0.5 text-[9px] font-bold text-accent-indigo uppercase tracking-wider">Beta</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-nexus-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-white/10 text-white rounded-br-sm' : 'bg-accent-indigo/20 border border-accent-indigo/30 text-nexus-100 rounded-bl-sm'
                }`}>
                  <p>{m.text}</p>
                  
                  {/* Dynamic Widgets embedded in chat */}
                  {m.widget === 'ATTRITION' && (
                    <div className="mt-3 rounded-lg bg-danger/10 border border-danger/20 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-danger">Engineering Risk</span>
                        <span className="text-xs font-bold text-danger">High</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-danger/20 overflow-hidden">
                        <div className="h-full w-[68%] bg-danger rounded-full" />
                      </div>
                    </div>
                  )}
                  {m.widget === 'PAYROLL' && (
                    <div className="mt-3 rounded-lg bg-success/10 border border-success/20 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-success">Projected Total</span>
                        <span className="text-sm font-bold text-success">₹59.2L</span>
                      </div>
                      <span className="text-[10px] text-success/80">+4.2% vs last month</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-accent-indigo/20 border border-accent-indigo/30 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <motion.div className="h-1.5 w-1.5 bg-accent-indigo rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="h-1.5 w-1.5 bg-accent-indigo rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="h-1.5 w-1.5 bg-accent-indigo rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your workforce..."
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-4 pr-12 text-sm text-nexus-100 placeholder-nexus-500 outline-none focus:border-accent-indigo/50 focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-accent-indigo to-accent-violet text-white disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 -ml-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </>
  )
}
