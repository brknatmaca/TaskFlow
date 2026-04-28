import { useState } from 'react'
import { useBoards } from '../hooks/useBoards'
import BoardCanvas from './BoardCanvas'

function BoardPicker({ boards, loading, onCreate, onSelect, onDelete }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const board = await onCreate(title.trim())
      setTitle('')
      onSelect(board.id)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      <h2 className="text-white font-semibold text-lg mb-6">Your Boards</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New board name…"
          className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm
                     rounded-lg px-3 py-2 placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-violet-500
                     focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                     text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          {saving ? '…' : 'Create'}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boards.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No boards yet.</p>
      ) : (
        <ul className="space-y-2">
          {boards.map(board => (
            <li key={board.id}
                className="flex items-center justify-between bg-gray-900 border
                           border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700
                           transition-colors group">
              <button
                onClick={() => onSelect(board.id)}
                className="text-gray-100 text-sm font-medium hover:text-violet-400
                           transition-colors flex-1 text-left"
              >
                {board.title}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${board.title}"?`)) onDelete(board.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-600
                           hover:text-red-400 transition-all ml-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function BoardView() {
  const [activeBoardId, setActiveBoardId] = useState(null)
  const { boards, loading, createBoard, deleteBoard } = useBoards()

  if (activeBoardId) {
    return (
      <BoardCanvas
        boardId={activeBoardId}
        onBack={() => setActiveBoardId(null)}
      />
    )
  }

  return (
    <BoardPicker
      boards={boards}
      loading={loading}
      onCreate={createBoard}
      onSelect={setActiveBoardId}
      onDelete={async (id) => {
        await deleteBoard(id)
        if (activeBoardId === id) setActiveBoardId(null)
      }}
    />
  )
}