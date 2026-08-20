'use client'

export default function DashboardSearchBar() {
  return (
    <div className="mb-8 max-w-5xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 rounded-md blur opacity-25 transition duration-500 group-focus-within:opacity-75"
          style={{background:'linear-gradient(to right, rgba(16,185,129,0.2), rgba(208,188,255,0.2))'}} />
        <div className="relative flex items-center rounded-md px-6 py-4"
          style={{background:'rgba(22,27,43,0.8)', backdropFilter:'blur(16px)', border:'1px solid rgba(39,39,42,0.2)'}}>
          <span className="material-symbols-outlined mr-4" style={{color:'#71717a'}}>search</span>
          <input
            className="bg-transparent border-none focus:ring-0 w-full font-medium"
            placeholder="Search projects by skill or description... (AI search coming in Phase 4)"
            style={{color:'#f4f4f5', outline:'none'}}
            disabled
          />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{background:'rgba(208,188,255,0.1)', border:'1px solid rgba(208,188,255,0.2)'}}>
            <span className="material-symbols-outlined text-sm" style={{color:'#d0bcff', fontSize:'16px'}}>bolt</span>
            <span style={{fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'#d0bcff', textTransform:'uppercase'}}>
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
