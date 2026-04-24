// Wraps content with shadow, padding, rounded corners
export function Card({ children, className = '', hover = false }: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`
      bg-[#1E293B] rounded-xl shadow-md ring-1 ring-slate-700
      p-4 ${hover ? 'hover:ring-slate-500 transition-all cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}