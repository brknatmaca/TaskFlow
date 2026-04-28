import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useBoards() {
  const { user } = useAuth()
  const [boards, setBoards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchBoards = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setBoards(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  const createBoard = useCallback(async (title) => {
    const { data, error } = await supabase
      .from('boards')
      .insert({ title, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setBoards(prev => [data, ...prev])
    return data
  }, [user])

  const deleteBoard = useCallback(async (boardId) => {
    const snapshot = boards
    setBoards(prev => prev.filter(b => b.id !== boardId))
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) { setBoards(snapshot); throw error }
  }, [boards])

  return { boards, loading, error, createBoard, deleteBoard }
}