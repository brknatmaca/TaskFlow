import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Card({ card, onDelete, isDragOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(card.id),
    data: { type: 'card', card }
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  const getTagColor = (tag) => {
    const tags = {
      'Acil': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Önemli': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'İyileştirme': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Yeni': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    }
    return tags[tag] || 'bg-zinc-700/50 text-zinc-400 border-zinc-600/50'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-[#1E2128] p-3.5 rounded-xl border border-white/5 hover:border-violet-500/50 transition-all ${
        isDragOverlay ? 'shadow-2xl ring-2 ring-violet-500' : ''
      }`}
    >
      <div className="flex flex-col gap-2">
        
        {/* Üst Kısım: Etiket ve Silme Butonu */}
        <div className="flex items-start justify-between">
          {card.tag && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getTagColor(card.tag)}`}>
              {card.tag.toUpperCase()}
            </span>
          )}
          <button 
            onClick={(e) => { 
              e.stopPropagation()
              onDelete() 
            }} 
            onPointerDown={(e) => e.stopPropagation()} 
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 ml-auto transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Orta Kısım: Başlık */}
        <h3 className="text-gray-200 text-sm font-semibold leading-tight">
          {card.title}
        </h3>

        {/* Orta Alt Kısım: Açıklama */}
        {card.description && (
          <p className="text-gray-500 text-[11px] leading-snug line-clamp-3 mt-1">
            {card.description}
          </p>
        )}

        {/* Alt Kısım: Tarih */}
        {card.due_date && (
          <div className="flex items-center gap-1.5 mt-2 border-t border-white/5 pt-2">
            <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-zinc-500 font-medium">
              {new Date(card.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}