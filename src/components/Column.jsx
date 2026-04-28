import { useState } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'

export default function Column({ column, onAddCard, onDeleteCard, onDeleteColumn }) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardTag, setNewCardTag] = useState('')
  const [newCardDueDate, setNewCardDueDate] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')

  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({
    id: String(column.id),
    data: { type: "column", column: column },
  })

  const style = { 
    transition, 
    transform: CSS.Translate.toString(transform) 
  }

  // Hayalet Sütun (Sürüklerken arkada kalan iz)
  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="w-[300px] min-h-[150px] shrink-0 bg-[#16181D]/50 border-2 border-dashed border-violet-500/50 rounded-xl" 
      />
    )
  }

  const handleAddCard = (e) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    
    // Açıklama (newCardDesc) backend'e gönderiliyor
    onAddCard(column.id, newCardTitle, newCardTag, newCardDueDate, newCardDesc)
    
    setNewCardTitle('')
    setNewCardTag('')
    setNewCardDueDate('')
    setNewCardDesc('')
    setIsAdding(false)
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="w-[300px] min-h-[150px] shrink-0 flex flex-col bg-[#16181D] rounded-xl max-h-full border border-white/10"
    >
      
      {/* SÜTUN BAŞLIĞI (TUTMA KULPU) */}
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between p-4 cursor-grab active:cursor-grabbing border-b border-white/10 group"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-sm select-none">
            {column.title}
          </h2>
          <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full">
            {column.cards?.length || 0}
          </span>
        </div>
        <button 
          onClick={() => onDeleteColumn(column.id)} 
          onPointerDown={(e) => e.stopPropagation()} 
          className="text-gray-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* KART LİSTESİ */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
        <SortableContext 
          items={column.cards?.map(c => String(c.id)) || []} 
          strategy={verticalListSortingStrategy}
        >
          {column.cards?.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onDelete={() => onDeleteCard(column.id, card.id)} 
            />
          ))}
        </SortableContext>
      </div>

      {/* KART EKLEME FORMU */}
      <div className="p-3 mt-auto border-t border-white/10">
        {isAdding ? (
          <form onSubmit={handleAddCard} className="flex flex-col gap-3">
            
            <input 
              type="text" 
              autoFocus 
              value={newCardTitle} 
              onChange={(e) => setNewCardTitle(e.target.value)} 
              placeholder="Görev adı..." 
              className="w-full bg-[#22252A] text-white text-sm rounded-lg p-2.5 outline-none border border-violet-500/50 focus:border-violet-500 transition-colors placeholder:text-gray-500" 
            />
            
            <textarea 
              value={newCardDesc} 
              onChange={(e) => setNewCardDesc(e.target.value)} 
              placeholder="Detaylı açıklama ekleyin..." 
              className="w-full bg-[#22252A] text-white text-xs rounded-lg p-2.5 outline-none border border-white/10 min-h-[60px] resize-none focus:border-violet-500 transition-colors"
            />

            <div className="flex gap-2">
              <select 
                value={newCardTag} 
                onChange={(e) => setNewCardTag(e.target.value)} 
                className="flex-1 bg-[#22252A] text-white text-xs rounded-lg p-2 outline-none border border-white/10 focus:border-violet-500"
              >
                <option value="">Etiket...</option>
                <option value="Acil">Acil</option>
                <option value="Önemli">Önemli</option>
                <option value="İyileştirme">İyileştirme</option>
                <option value="Yeni">Yeni</option>
              </select>
              <input 
                type="date" 
                value={newCardDueDate} 
                onChange={(e) => setNewCardDueDate(e.target.value)} 
                className="flex-1 bg-[#22252A] text-white text-xs rounded-lg p-2 outline-none border border-white/10 [color-scheme:dark] focus:border-violet-500" 
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button 
                type="submit" 
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                Ekle
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kart
          </button>
        )}
      </div>
    </div>
  )
}