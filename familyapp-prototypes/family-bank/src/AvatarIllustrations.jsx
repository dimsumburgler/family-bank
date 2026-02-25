// Simple avatar component using styled initials
// Reliable, fast, no external dependencies

export function ChildAvatar({ child, isSelected, onClick }) {
  const colors = {
    alex: { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', ring: 'ring-amber-300' },
    sam: { bg: 'bg-gradient-to-br from-sky-400 to-blue-500', ring: 'ring-sky-300' },
    default: { bg: 'bg-gradient-to-br from-stone-400 to-stone-500', ring: 'ring-stone-300' }
  };
  
  const color = colors[child.id] || colors.default;
  
  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
    >
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${color.bg} 
        flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg
        ${isSelected ? `ring-4 ${color.ring} ring-offset-2 ring-offset-amber-50 animate-pulse-glow` : 'hover:shadow-xl'}
        transition-all duration-300`}
      >
        {child.name[0]}
      </div>
      <div className={`mt-2 text-center transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
        <div className="font-semibold text-stone-800 text-sm">{child.name}</div>
        <div className="text-xs text-stone-500">Age {child.age}</div>
      </div>
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full" />
      )}
    </button>
  );
}

export function AddChildAvatar({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-colors bg-stone-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.3" />
          <path d="M18 4v4M16 6h4" strokeWidth="1.5" />
        </svg>
      </div>
      <span className="text-sm text-stone-500">Add</span>
    </button>
  );
}
