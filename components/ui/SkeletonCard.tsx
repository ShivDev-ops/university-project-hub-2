export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-4 animate-pulse ring-1 ring-slate-700">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-700 rounded w-full mb-2" />
      <div className="h-3 bg-slate-700 rounded w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        {[1,2,3].map(i => <div key={i} className="h-5 w-16 bg-slate-700 rounded-full" />)}
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-700 rounded" />
        <div className="h-8 w-20 bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}