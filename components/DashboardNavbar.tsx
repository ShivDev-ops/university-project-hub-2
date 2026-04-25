'use client'
import Link from 'next/link'

export default function DashboardNavbar({ profile }: { profile: any }) {
  return (
    <header className="fixed top-0 w-full h-[60px] backdrop-blur-xl border-b flex justify-between items-center px-6 z-50"
      style={{background:'rgba(14,19,34,0.6)', borderColor:'rgba(66,71,84,0.15)', boxShadow:'0 0 20px rgba(77,142,255,0.1)'}}>
      <div className="flex items-center gap-8">
        <Link href="/dashboard">
          <div style={{fontFamily:'Syne', fontSize:'20px', fontWeight:900, letterSpacing:'-0.05em', color:'#adc6ff', cursor:'pointer'}}>
            PROJECT_HUB
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" style={{fontSize:'14px', fontWeight:500, color:'#adc6ff', borderBottom:'2px solid #adc6ff', paddingBottom:'4px'}}>Discover</Link>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Labs</a>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Teams</a>
          <a href="#" style={{fontSize:'14px', fontWeight:500, color:'#c2c6d6'}} className="hover:text-[#adc6ff] transition-colors">Archive</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/notifications">
          <button className="p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
            <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>notifications</span>
          </button>
        </Link>
        <button className="p-2 rounded-lg transition-all hover:bg-[#4d8eff]/20">
          <span className="material-symbols-outlined" style={{color:'#c2c6d6'}}>terminal</span>
        </button>
        <Link href="/profile/edit">
          <div className="w-8 h-8 rounded-full border-2 overflow-hidden" style={{borderColor:'#adc6ff'}}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{background:'#25293a'}}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#adc6ff'}}>person</span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}
