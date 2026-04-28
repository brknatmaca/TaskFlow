import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Pozisyon Hesaplama (Fractional Indexing): 
 * Yeni öğeyi tüm listeyi güncellemeden araya yerleştirmek için (before + after) / 2 mantığını kullanır.
 * Bu yöntem veritabanı performansını (O(1)) maksimize eder.
 */
export function computePosition(items, overIndex) {
  const GAP = 1000
  const before = items[overIndex - 1]?.position ?? null
  const after  = items[overIndex + 1]?.position ?? null
  
  if (before === null && after !== null) return after / 2
  if (before !== null && after === null) return before + GAP
  if (before === null && after === null) return GAP
  
  return (before + after) / 2
}

export function useBoard(boardId) {
  const { user } = useAuth()
  const [columns, setColumns] = useState([])
  const [board, setBoard]     = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. VERİ ÇEKME: Board, Sütunlar ve Kartları ilişkisel olarak çeker
  const fetchBoard = useCallback(async () => {
    if (!boardId || !user) return
    setLoading(true)
    try {
      const { data: boardData } = await supabase.from('boards').select('*').eq('id', boardId).single()
      setBoard(boardData)

      // Sütunları pozisyona göre sıralı al
      const { data: cols } = await supabase.from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true })

      if (!cols || cols.length === 0) {
        setColumns([])
        return
      }

      // Kartları pozisyona göre sıralı al
      const { data: cards } = await supabase.from('cards')
        .select('*')
        .in('column_id', cols.map(c => c.id))
        .order('position', { ascending: true })

      // Sütunların içine kartları yerleştir (ID'leri String'e zorlayarak güvenliği sağla)
      const nested = cols.map(col => ({
        ...col,
        cards: cards?.filter(card => String(card.column_id) === String(col.id)) || [],
      }))
      
      setColumns(nested)
    } finally {
      setLoading(false)
    }
  }, [boardId, user])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  // 2. KART TAŞIMA (Veritabanı Güncelleme)
  const moveCard = useCallback(async (cardId, toColumnId, newPosition) => {
    await supabase.from('cards')
      .update({ column_id: toColumnId, position: newPosition })
      .eq('id', cardId)
  }, [])

  // 3. SÜTUN TAŞIMA (Veritabanı Güncelleme)
  const moveColumn = useCallback(async (columnId, newPosition) => {
    await supabase.from('columns')
      .update({ position: newPosition })
      .eq('id', columnId)
  }, [])

  // 4. SÜTUN EKLEME
  const addColumn = useCallback(async (title) => {
    const lastPos = columns.at(-1)?.position ?? 0
    const position = lastPos + 1000
    const { data } = await supabase.from('columns')
      .insert({ board_id: boardId, title, position })
      .select()
      .single()
      
    if (data) setColumns(prev => [...prev, { ...data, cards: [] }])
  }, [boardId, columns])

  // 5. KART EKLEME (Title, Tag, DueDate, Description alanlarını kapsar)
  const addCard = useCallback(async (columnId, title, tag = null, dueDate = null, description = null) => {
    const col = columns.find(c => String(c.id) === String(columnId))
    const lastPos = col?.cards?.at(-1)?.position ?? 0
    const position = lastPos + 1000
    
    const { data, error } = await supabase.from('cards')
      .insert({ 
        column_id: columnId, 
        title, 
        position,
        tag: tag || null,
        due_date: dueDate || null,
        description: description || null
      })
      .select()
      .single()
      
    if (data) fetchBoard()
    if (error) console.error("Kart eklenirken hata oluştu:", error.message)
  }, [columns, fetchBoard])

  // 6. SİLME İŞLEMLERİ
  const deleteColumn = useCallback(async (id) => {
    setColumns(prev => prev.filter(c => String(c.id) !== String(id)))
    await supabase.from('columns').delete().eq('id', id)
  }, [])

  const deleteCard = useCallback(async (colId, cardId) => {
    setColumns(prev => prev.map(c => 
      String(c.id) === String(colId) 
        ? { ...c, cards: c.cards.filter(card => String(card.id) !== String(cardId)) } 
        : c
    ))
    await supabase.from('cards').delete().eq('id', cardId)
  }, [])

  return { 
    board, columns, loading, 
    addColumn, deleteColumn, 
    addCard, deleteCard, 
    moveCard, moveColumn, 
    setColumns 
  }
}