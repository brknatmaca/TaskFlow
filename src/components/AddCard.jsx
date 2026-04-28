import { useState, useRef, useEffect } from 'react'

export default function AddCard({ onAdd }) {
  const [open, setOpen]     = useState(false)
  const [title, setTitle]   = useState('')
  const [saving, setSaving] = useState(false)
  const textareaRef         = useRef(null)

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd(title.trim())
      setTitle('')
      // Stay open so the user can add another card immediately
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
    if (e.key === 'Escape') { setOpen(false); setTitle('') }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-gray-500 hover:text-gray-300 text-sm
                   px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-colors
                   flex items-center gap-1.5 mt-1"
      >
        <span className="text-lg leading-none">+</span> Add card
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 space-y-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Card title…"
        rows={2}
        className="w-full bg-gray-700 border border-gray-600 text-white text-sm
                   rounded-lg px-3 py-2 placeholder-gray-500 resize-none
                   focus:outline-none focus:ring-2 focus:ring-violet-500
                   focus:border-transparent transition"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                     text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          {saving ? 'Adding…' : 'Add card'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle('') }}
          className="text-gray-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}