import { useState, useRef, useEffect } from 'react'

export default function AddColumn({ onAdd }) {
  const [open, setOpen]     = useState(false)
  const [title, setTitle]   = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef            = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd(title.trim())
      setTitle('')
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); setTitle('') }
  }

  if (!open) {
    return (
      <div className="shrink-0 w-72">
        <button
          onClick={() => setOpen(true)}
          className="w-full text-gray-400 hover:text-white bg-gray-800/60
                     hover:bg-gray-800 border border-dashed border-gray-700
                     hover:border-gray-600 rounded-xl px-4 py-3 text-sm
                     flex items-center gap-2 transition-all"
        >
          <span className="text-lg leading-none">+</span> Add column
        </button>
      </div>
    )
  }

  return (
    <div className="shrink-0 w-72 bg-gray-900 border border-gray-700 rounded-xl p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Column title…"
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm
                     rounded-lg px-3 py-2 placeholder-gray-500
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
            {saving ? 'Adding…' : 'Add column'}
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
    </div>
  )
}