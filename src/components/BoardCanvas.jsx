import { useState, useCallback } from 'react'
import {
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  TouchSensor, 
  KeyboardSensor,
  useSensor, 
  useSensors, 
  closestCorners,
} from '@dnd-kit/core'
import { 
  sortableKeyboardCoordinates, 
  SortableContext, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable'
import { useBoard, computePosition } from '../hooks/useBoard'
import Column from './Column'
import AddColumn from './AddColumn'
import Card from './Card'

export default function BoardCanvas({ boardId, onBack }) {
  const {
    board, 
    columns, 
    loading, 
    addColumn, 
    deleteColumn, 
    addCard, 
    deleteCard,
    moveCard, 
    moveColumn, 
    setColumns
  } = useBoard(boardId)

  // Hem sürüklenen kartı hem de sütunu takip eden state'ler
  const [activeCard, setActiveCard] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)

  // Mobil uyumluluk ve yanlışlıkla kaydırmayı önleyen sensör ayarları
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // YARDIMCILAR: Veritabanı (UUID) ve Frontend (String) uyuşmazlıklarını önler
  const findColumnByCardId = useCallback((cardId) => {
    return columns.find(col => col.cards.some(c => String(c.id) === String(cardId)))
  }, [columns])

  const findColumnById = useCallback((colId) => {
    return columns.find(col => String(col.id) === String(colId))
  }, [columns])

  // 1. SÜRÜKLEME BAŞLADIĞINDA
  const handleDragStart = useCallback(({ active }) => {
    // Kütüphane etiketine VE bizim ID kontrolümüze bakarak ne taşındığını bul
    const isDraggingColumn = active.data.current?.type === 'column' || !!findColumnById(active.id);

    if (isDraggingColumn) {
      const col = findColumnById(active.id)
      setActiveColumn(col ?? null)
      return
    }
    
    const sourceCol = findColumnByCardId(active.id)
    if (!sourceCol) return
    const card = sourceCol.cards.find(c => String(c.id) === String(active.id))
    setActiveCard(card ?? null)
  }, [findColumnByCardId, findColumnById])

  // 2. SÜRÜKLEME SIRASINDA (Sadece Kartların Gruplar Arası Geçişi)
  const handleDragOver = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return
    
    const isDraggingColumn = active.data.current?.type === 'column' || !!findColumnById(active.id);
    if (isDraggingColumn) return

    const activeCol = findColumnByCardId(active.id)
    
    // Zırhlı Hedef Bulucu
    let overColId = null;
    if (findColumnById(over.id)) overColId = over.id;
    else if (findColumnByCardId(over.id)) overColId = findColumnByCardId(over.id).id;

    const overCol = columns.find(c => String(c.id) === String(overColId))

    if (!activeCol || !overCol || activeCol.id === overCol.id) return

    setColumns(prev => {
      let draggedCard = null
      
      const next = prev.map(col => {
        if (String(col.id) !== String(activeCol.id)) return col
        return { 
          ...col, 
          cards: col.cards.filter(c => {
            if (String(c.id) === String(active.id)) { draggedCard = c; return false }
            return true
          }) 
        }
      })
      
      if (!draggedCard) return prev
      
      return next.map(col => {
        if (String(col.id) !== String(overCol.id)) return col
        const isOverColumn = !!findColumnById(over.id);
        const overIdx = !isOverColumn ? col.cards.findIndex(c => String(c.id) === String(over.id)) : col.cards.length
        
        const newCards = [...col.cards]
        newCards.splice(overIdx >= 0 ? overIdx : newCards.length, 0, { ...draggedCard, column_id: overCol.id })
        return { ...col, cards: newCards }
      })
    })
  }, [findColumnByCardId, findColumnById, columns, setColumns])

  // 3. SÜRÜKLEME BİTTİĞİNDE (Fizik Motoru ve Veritabanı Mühürleme)
  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveCard(null)
    setActiveColumn(null)
    if (!over) return

    const isDraggingColumn = active.data.current?.type === 'column' || !!findColumnById(active.id);

    // ZIRHLI HEDEF BULUCU (dnd-kit veriyi kaybetse bile ID'den hedefi %100 bulur)
    let overColumnId = null;
    if (findColumnById(over.id)) overColumnId = over.id;
    else if (findColumnByCardId(over.id)) overColumnId = findColumnByCardId(over.id).id;

    if (!overColumnId) return

    // --- A) SÜTUN TAŞIMA MANTIĞI ---
    if (isDraggingColumn) {
      if (String(active.id) === String(overColumnId)) return

      const oldIndex = columns.findIndex(c => String(c.id) === String(active.id))
      const newIndex = columns.findIndex(c => String(c.id) === String(overColumnId))
      
      if (oldIndex === -1 || newIndex === -1) return

      const newColumnsList = [...columns];
      const [movedCol] = newColumnsList.splice(oldIndex, 1);
      const clonedCol = { ...movedCol };
      newColumnsList.splice(newIndex, 0, clonedCol);

      // KRİTİK FİX: Pozisyonları güvenli Number'a çevir (NaN hatalarını önler)
      let bPos = newColumnsList[newIndex - 1]?.position;
      let aPos = newColumnsList[newIndex + 1]?.position;
      
      bPos = (bPos !== undefined && bPos !== null) ? Number(bPos) : null;
      aPos = (aPos !== undefined && aPos !== null) ? Number(aPos) : null;

      let newPos = 1000;
      if (bPos === null && aPos !== null) newPos = aPos - 1000;
      else if (bPos !== null && aPos === null) newPos = bPos + 1000;
      else if (bPos !== null && aPos !== null) newPos = (bPos + aPos) / 2;

      // KRİTİK FİX: Supabase'in reddetmemesi için tam sayıya yuvarla
      newPos = Math.round(newPos);

      clonedCol.position = newPos;
      
      setColumns([...newColumnsList].sort((a, b) => a.position - b.position));

      await moveColumn(active.id, newPos)
      return
    }

    // --- B) KART TAŞIMA MANTIĞI ---
    const toColumnId = overColumnId
    const sourceCol = findColumnByCardId(active.id)
    const destCol = findColumnById(toColumnId)

    if (!sourceCol || !destCol) return

    let destCards = [...destCol.cards]
    const isSameColumn = String(sourceCol.id) === String(destCol.id)
    let newIndex = -1
    const isOverColumnArea = !!findColumnById(over.id);

    if (isSameColumn) {
      const oldIndex = destCards.findIndex(c => String(c.id) === String(active.id))
      newIndex = isOverColumnArea 
        ? destCards.length - 1 
        : destCards.findIndex(c => String(c.id) === String(over.id))
        
      if (oldIndex === -1 || newIndex === -1) return
      
      const [movedCard] = destCards.splice(oldIndex, 1)
      destCards.splice(newIndex, 0, movedCard)
    } else {
      newIndex = isOverColumnArea 
        ? destCards.length 
        : destCards.findIndex(c => String(c.id) === String(over.id))
        
      if (newIndex === -1) newIndex = destCards.length;
    }

    const neighbours = destCards.filter(c => String(c.id) !== String(active.id))
    const withPhantom = [...neighbours]
    withPhantom.splice(newIndex, 0, { position: null })
    const newPosition = computePosition(withPhantom, newIndex)

    setColumns(prev => prev.map(col => {
      if (String(col.id) !== String(toColumnId)) return col
      
      const updatedCards = destCards.map(card => 
        String(card.id) === String(active.id) 
          ? { ...card, position: newPosition, column_id: toColumnId } 
          : card
      ).sort((a, b) => (a.position || 0) - (b.position || 0))
      
      return { ...col, cards: updatedCards }
    }))

    await moveCard(active.id, toColumnId, newPosition)

  }, [columns, findColumnByCardId, findColumnById, moveCard, moveColumn, setColumns])

  // Yükleme Ekranı
  if (loading) return (
    <div className="flex items-center justify-center h-full text-violet-400 font-medium animate-pulse">
      Pano senkronize ediliyor...
    </div>
  )

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full p-4 select-none">
        
        {/* Üst Bar */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <button 
            onClick={onBack} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-gray-400 hover:text-white transition-all text-lg font-bold"
          >
            ←
          </button>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            {board?.title}
          </h1>
        </div>
        
        {/* Yatay Kaydırılabilir Sütun Alanı */}
        <div className="flex gap-6 items-start overflow-x-auto h-full pb-10 custom-scrollbar px-2">
          
          {/* SÜTUN SÜRÜKLEME CONTEXT'İ */}
          <SortableContext items={columns.map(c => String(c.id))} strategy={horizontalListSortingStrategy}>
            {columns.map(col => (
              <Column 
                key={col.id} 
                column={col} 
                onAddCard={addCard} 
                onDeleteCard={deleteCard} 
                onDeleteColumn={deleteColumn} 
              />
            ))}
          </SortableContext>
          
          <AddColumn onAdd={addColumn} />
        </div>
      </div>

      {/* Sürükleme Efektleri (Hayalet Önizlemeler) */}
      <DragOverlay>
        {activeColumn ? (
          <div className="opacity-80 scale-105 shadow-2xl cursor-grabbing">
            {/* Sütun taşınırken formların tetiklenmesini önlemek için boş fonksiyonlar */}
            <Column column={activeColumn} onAddCard={() => {}} onDeleteCard={() => {}} onDeleteColumn={() => {}} />
          </div>
        ) : activeCard ? (
          <div className="opacity-90 rotate-2 cursor-grabbing w-[280px] shadow-2xl ring-2 ring-violet-500 rounded-xl">
            <Card card={activeCard} onDelete={() => {}} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}