import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useChatStore } from '@/store'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('PUBLIC_CHANNEL')
  const { createChannel } = useChatStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createChannel(name, type)
    setName('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-nexus-900 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Create Channel</h3>
              <button onClick={onClose} className="rounded-full p-1 text-nexus-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-2">Channel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. engineering-team"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white placeholder-nexus-500 focus:border-accent-indigo focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-2">Channel Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-accent-indigo focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                >
                  <option value="PUBLIC_CHANNEL">Public Channel (Anyone can join)</option>
                  <option value="PRIVATE_CHANNEL">Private Channel (Invite only)</option>
                  <option value="DEPARTMENT_CHANNEL">Department Channel</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-nexus-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="rounded-xl bg-accent-indigo px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-indigo/90 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
