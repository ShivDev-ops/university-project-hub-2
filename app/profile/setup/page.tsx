// File: app/profile/setup/page.tsx
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useFingerprint } from '@/hooks/useFingerprint'

const SKILL_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Machine Learning',
  'Node.js', 'PostgreSQL', 'Docker', 'Flutter', 'C++',
  'Java', 'Data Science', 'UI/UX Design', 'DevOps', 'MongoDB',
  'PyTorch', 'TensorFlow', 'Rust', 'CUDA', 'WebGL',
  'Quantum Computing', 'Ethics in AI', 'Blockchain', 'Swift', 'Kotlin'
]

export default function ProfileSetupPage() {
  const [bio, setBio] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [academicFocus, setAcademicFocus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [customSkill, setCustomSkill] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fingerprint = useFingerprint()
  const router = useRouter()
  const { update } = useSession()

  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function addCustomSkill() {
    const skill = customSkill.trim()
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill])
    }
    setCustomSkill('')
    setShowCustomInput(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        skills:        selectedSkills,
        github_url:    githubUrl,
        full_name:     fullName,
        academic_focus: academicFocus,
        fingerprint,
      }),
    })

    if (!res.ok) {
      setError('Failed to save profile. Please try again.')
      setLoading(false)
      return
    }

    await update()
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <>
      {/* Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=Manrope:wght@200;300;400;500;600;700;800&family=Inter:wght@400;500;600&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        .glass-panel {
          background: rgba(26, 31, 47, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(173, 198, 255, 0.1);
        }
        .neon-glow-primary { box-shadow: 0 0 20px rgba(77, 142, 255, 0.3); }
        .neon-glow-tertiary { box-shadow: 0 0 15px rgba(160, 120, 255, 0.2); }
        .mesh-gradient {
          background: radial-gradient(circle at 50% 50%, rgba(77, 142, 255, 0.05) 0%, rgba(14, 19, 34, 1) 70%);
        }
        .dot-grid {
          background-image: radial-gradient(rgba(173, 198, 255, 0.1) 1px, transparent 0);
          background-size: 24px 24px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(14, 19, 34, 1); }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(160, 120, 255, 0.3);
          border-radius: 10px;
        }
        body { 
          background-color: #0e1322; 
          color: #dee1f7;
          font-family: 'Manrope', sans-serif;
        }
      `}</style>

      <div className="fixed inset-0 z-[-1] mesh-gradient" />
      <div className="fixed inset-0 z-[-1] dot-grid opacity-30" />

      <div className="fixed top-1/2 -left-12 -translate-y-1/2 rotate-90 hidden lg:block">
        <span style={{fontFamily:'DM Mono', fontSize:'10px', letterSpacing:'0.5em', color:'rgba(140,144,159,0.2)', textTransform:'uppercase'}}>
          DECENTRALIZED ACADEMIC NETWORK
        </span>
      </div>
      <div className="fixed top-1/2 -right-12 -translate-y-1/2 -rotate-90 hidden lg:block">
        <span style={{fontFamily:'DM Mono', fontSize:'10px', letterSpacing:'0.5em', color:'rgba(140,144,159,0.2)', textTransform:'uppercase'}}>
          AUTH_TOKEN: 8XJ-92P-Q01
        </span>
      </div>

      <main className="min-h-screen overflow-y-auto custom-scrollbar flex flex-col items-center py-12 px-6">

        {/* Branding Header */}
        <div className="w-full max-w-2xl mb-12 flex justify-between items-end">
          <div>
            <h1 style={{fontFamily:'Syne', fontSize:'2.25rem', fontWeight:800, letterSpacing:'-0.05em', color:'#adc6ff', textTransform:'uppercase'}}>
              PROJECT-HUB
            </h1>
            <p style={{fontFamily:'DM Mono', fontSize:'10px', letterSpacing:'0.2em', color:'#8c909f', textTransform:'uppercase', marginTop:'4px'}}>
              Protocol: Profile_Setup_v1.0
            </p>
          </div>
          <div className="text-right">
            <span style={{fontFamily:'DM Mono', fontSize:'12px', color:'#6bd8cb', display:'block', marginBottom:'4px'}}>
              SYSTEM.INITIALIZE
            </span>
            <div className="flex gap-1">
              <div className="h-1 w-8" style={{background:'#6bd8cb'}} />
              <div className="h-1 w-8" style={{background:'#2f3445'}} />
              <div className="h-1 w-8" style={{background:'#2f3445'}} />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl glass-panel p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{background:'linear-gradient(to bottom-left, rgba(160,120,255,0.1), transparent)'}} />
          <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
            style={{background:'linear-gradient(to top-right, rgba(77,142,255,0.1), transparent)'}} />

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Identity Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{background:'linear-gradient(to right, transparent, rgba(66,71,84,0.3), transparent)'}} />
                <span style={{fontFamily:'Syne', fontSize:'12px', fontWeight:700, letterSpacing:'0.2em', color:'#c2c6d6', textTransform:'uppercase'}}>
                  Identity
                </span>
                <div className="h-px flex-1" style={{background:'linear-gradient(to right, transparent, rgba(66,71,84,0.3), transparent)'}} />
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Avatar Upload */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
                    style={{border:'2px dashed #424754', background:'#161b2b', transition:'border-color 0.2s'}}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined" style={{fontSize:'2rem', color:'#424754'}}>
                        add_a_photo
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg"
                    style={{background:'#adc6ff'}}>
                    <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#002e6a'}}>
                      edit
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'4px'}}>
                      Full Name
                    </label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="YOUR NAME"
                      style={{width:'100%', background:'#161b2b', borderBottom:'2px solid #424754', color:'#dee1f7', padding:'8px 0', fontFamily:'Syne', fontWeight:700, textTransform:'uppercase', letterSpacing:'-0.02em', outline:'none'}}
                      onFocus={e => e.target.style.borderBottomColor = '#adc6ff'}
                      onBlur={e => e.target.style.borderBottomColor = '#424754'}
                    />
                  </div>
                  <div>
                    <label style={{fontFamily:'DM Mono', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', letterSpacing:'0.15em', display:'block', marginBottom:'4px'}}>
                      Academic Focus
                    </label>
                    <input
                      value={academicFocus}
                      onChange={e => setAcademicFocus(e.target.value)}
                      placeholder="Your specialization"
                      style={{width:'100%', background:'#161b2b', borderBottom:'2px solid #424754', color:'#c2c6d6', padding:'8px 0', fontSize:'14px', outline:'none'}}
                      onFocus={e => e.target.style.borderBottomColor = '#adc6ff'}
                      onBlur={e => e.target.style.borderBottomColor = '#424754'}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Bio Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'#dee1f7', letterSpacing:'-0.02em'}}>
                  Research Statement
                </h3>
                <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  {bio.length} / 250
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 250))}
                  placeholder="Briefly describe your specialization and project interests..."
                  rows={4}
                  className="custom-scrollbar"
                  style={{width:'100%', background:'rgba(22,27,43,0.5)', border:'1px solid rgba(66,71,84,0.3)', color:'#c2c6d6', padding:'16px', fontSize:'14px', resize:'none', outline:'none', transition:'border-color 0.2s'}}
                  onFocus={e => e.target.style.borderColor = '#d0bcff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.3)'}
                />
                <div className="absolute top-0 right-0 h-1 w-1"
                  style={{background:'#d0bcff', boxShadow:'0 0 5px rgba(208,188,255,0.8)'}} />
              </div>
            </section>

            {/* Skills Section */}
            <section className="space-y-4">
              <h3 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'#dee1f7', letterSpacing:'-0.02em'}}>
                Technical Specialization
              </h3>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={selectedSkills.includes(skill) ? 'neon-glow-tertiary' : ''}
                    style={{
                      padding:'6px 16px',
                      borderRadius:'999px',
                      fontFamily:'DM Mono',
                      fontSize:'10px',
                      textTransform:'uppercase',
                      letterSpacing:'0.1em',
                      display:'flex',
                      alignItems:'center',
                      gap:'8px',
                      transition:'all 0.2s',
                      background: selectedSkills.includes(skill) ? 'rgba(160,120,255,0.1)' : '#25293a',
                      border: selectedSkills.includes(skill) ? '1px solid #d0bcff' : '1px solid rgba(66,71,84,0.2)',
                      color: selectedSkills.includes(skill) ? '#d0bcff' : '#c2c6d6',
                    }}
                  >
                    <span>{skill}</span>
                    {selectedSkills.includes(skill) && (
                      <span className="material-symbols-outlined" style={{fontSize:'12px'}}>close</span>
                    )}
                  </button>
                ))}

                {/* Custom skills added by user */}
                {selectedSkills
                  .filter(s => !SKILL_OPTIONS.includes(s))
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="neon-glow-tertiary"
                      style={{
                        padding:'6px 16px',
                        borderRadius:'999px',
                        fontFamily:'DM Mono',
                        fontSize:'10px',
                        textTransform:'uppercase',
                        letterSpacing:'0.1em',
                        display:'flex',
                        alignItems:'center',
                        gap:'8px',
                        background:'rgba(160,120,255,0.1)',
                        border:'1px solid #d0bcff',
                        color:'#d0bcff',
                      }}
                    >
                      <span>{skill}</span>
                      <span className="material-symbols-outlined" style={{fontSize:'12px'}}>close</span>
                    </button>
                  ))
                }

                {/* Add custom skill */}
                {showCustomInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill() } if (e.key === 'Escape') setShowCustomInput(false) }}
                      placeholder="Type skill..."
                      style={{
                        background:'#161b2b',
                        border:'1px solid #adc6ff',
                        color:'#dee1f7',
                        padding:'4px 12px',
                        borderRadius:'999px',
                        fontFamily:'DM Mono',
                        fontSize:'10px',
                        outline:'none',
                        width:'120px',
                      }}
                    />
                    <button type="button" onClick={addCustomSkill}
                      style={{color:'#adc6ff', fontFamily:'DM Mono', fontSize:'10px'}}>
                      Add
                    </button>
                    <button type="button" onClick={() => setShowCustomInput(false)}
                      style={{color:'#8c909f', fontFamily:'DM Mono', fontSize:'10px'}}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    style={{
                      padding:'6px 16px',
                      borderRadius:'999px',
                      fontFamily:'DM Mono',
                      fontSize:'10px',
                      textTransform:'uppercase',
                      letterSpacing:'0.1em',
                      display:'flex',
                      alignItems:'center',
                      gap:'4px',
                      background:'transparent',
                      border:'1px solid rgba(66,71,84,0.3)',
                      color:'#adc6ff',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{fontSize:'12px'}}>add</span>
                    Add Protocol
                  </button>
                )}
              </div>
            </section>

            {/* GitHub Section */}
            <section className="space-y-4">
              <h3 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'#dee1f7', letterSpacing:'-0.02em'}}>
                Repository Link
              </h3>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined" style={{color:'#8c909f'}}>terminal</span>
                </div>
                <input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="github.com/username"
                  type="url"
                  style={{
                    width:'100%',
                    background:'#161b2b',
                    border:'1px solid rgba(66,71,84,0.3)',
                    color:'#c2c6d6',
                    paddingLeft:'48px',
                    paddingRight:'16px',
                    paddingTop:'12px',
                    paddingBottom:'12px',
                    fontSize:'14px',
                    outline:'none',
                    borderRadius:'8px',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#adc6ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,84,0.3)'}
                />
              </div>
            </section>

            {/* Error */}
            {error && (
              <p style={{color:'#ffb4ab', fontSize:'14px', fontFamily:'DM Mono'}}>{error}</p>
            )}

            {/* Submit */}
            <div className="pt-6 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="neon-glow-primary"
                style={{
                  width:'100%',
                  background: loading ? '#424754' : '#adc6ff',
                  color:'#002e6a',
                  fontFamily:'Syne',
                  fontWeight:900,
                  textTransform:'uppercase',
                  letterSpacing:'0.2em',
                  padding:'20px',
                  borderRadius:'8px',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'12px',
                  transition:'all 0.2s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border:'none',
                }}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
                {!loading && (
                  <span className="material-symbols-outlined" style={{fontSize:'20px'}}>double_arrow</span>
                )}
              </button>
              <p style={{fontFamily:'DM Mono', fontSize:'10px', color:'#424754', letterSpacing:'0.2em', textTransform:'uppercase'}}>
                By finalizing, you accept the Research Governance Protocol
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 w-full max-w-2xl flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{border:'1px solid rgba(173,198,255,0.3)', background:'#161b2b'}}>
              <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#adc6ff'}}>
                shield
              </span>
            </div>
            <div className="flex flex-col">
              <span style={{fontFamily:'DM Mono', fontSize:'9px', color:'#8c909f', lineHeight:1}}>SERVER_STATUS</span>
              <span style={{fontFamily:'DM Mono', fontSize:'9px', color:'#6bd8cb', lineHeight:1, marginTop:'4px'}}>ONLINE / ENCRYPTED</span>
            </div>
          </div>
          <div className="text-right">
            <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#424754'}}>© 2024 NEON_SCHOLAR_NET</p>
          </div>
        </div>

      </main>
    </>
  )
}