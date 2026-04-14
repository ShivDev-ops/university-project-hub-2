// File: app/onboarding/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Manrope:wght@300;400;600&family=DM+Mono:wght@400;500&family=Inter:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #0e1322; color: #dee1f7; overflow-x: hidden; font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { backdrop-filter: blur(20px); background: rgba(26,31,47,0.6); }
        .neon-glow { box-shadow: 0 0 20px rgba(173,198,255,0.2); }
        .neon-glow:hover { box-shadow: 0 0 30px rgba(173,198,255,0.4); }
        .mesh { background: radial-gradient(circle at 50% 50%, rgba(77,142,255,0.05) 0%, rgba(14,19,34,1) 70%); }
        .dots { background-image: radial-gradient(rgba(173,198,255,0.1) 1px, transparent 1px); background-size: 24px 24px; }
        .btn-primary {
          padding: 16px 32px;
          background: #4d8eff;
          color: #00285d;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { transform: scale(0.98); }
        .btn-secondary {
          padding: 16px 32px;
          background: transparent;
          color: #dee1f7;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: 1px solid rgba(66,71,84,0.3);
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .btn-secondary:hover { background: #25293a; }
      `}</style>

      {/* Background */}
      <div style={{position:'fixed', inset:0, zIndex:-1}} className="mesh" />
      <div style={{position:'fixed', inset:0, zIndex:-1, opacity:0.2}} className="dots" />
      {/* Ambient glows */}
      <div style={{position:'fixed', top:'-10%', right:'-5%', width:'500px', height:'500px', background:'rgba(173,198,255,0.1)', borderRadius:'50%', filter:'blur(120px)', zIndex:-1}} />
      <div style={{position:'fixed', bottom:'-10%', left:'-5%', width:'400px', height:'400px', background:'rgba(208,188,255,0.1)', borderRadius:'50%', filter:'blur(100px)', zIndex:-1}} />

      <main style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 48px', position:'relative', overflow:'hidden'}}>

        {/* Floating particles */}
        <div style={{position:'absolute', top:'25%', left:'40px', width:'4px', height:'4px', background:'#6bd8cb', borderRadius:'50%', opacity:0.4, boxShadow:'0 0 8px #6bd8cb'}} />
        <div style={{position:'absolute', bottom:'33%', right:'80px', width:'8px', height:'8px', background:'#adc6ff', borderRadius:'50%', opacity:0.3, boxShadow:'0 0 10px #adc6ff'}} />
        <div style={{position:'absolute', top:'66%', left:'25%', width:'4px', height:'4px', background:'#d0bcff', borderRadius:'50%', opacity:0.5, boxShadow:'0 0 6px #d0bcff'}} />

        <div style={{maxWidth:'1100px', width:'100%', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'48px', alignItems:'center', position:'relative', zIndex:10}}>

          {/* Left Side */}
          <section style={{display:'flex', flexDirection:'column', gap:'32px'}}>
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{height:'1px', width:'48px', background:'rgba(107,216,203,0.5)'}} />
                <span style={{fontFamily:'Inter', fontSize:'11px', letterSpacing:'0.3em', color:'#6bd8cb', textTransform:'uppercase', fontWeight:600}}>
                  Protocol Initiation
                </span>
              </div>

              <h1 style={{fontFamily:'Syne', fontSize:'clamp(3rem, 6vw, 5rem)', fontWeight:800, lineHeight:1, letterSpacing:'-0.05em', color:'#dee1f7'}}>
                Welcome <br />
                <span style={{color:'#adc6ff', fontStyle:'italic'}}>
                  aboard{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
                </span>
              </h1>

              <p style={{fontSize:'18px', color:'#c2c6d6', maxWidth:'400px', fontWeight:300, lineHeight:1.6}}>
                Before you can browse projects and connect with teammates, we need a few details about you.
              </p>
            </div>

            <div style={{display:'flex', flexWrap:'wrap', gap:'16px'}}>
              <button
                className="neon-glow btn-primary"
                onClick={() => router.push('/profile/setup')}
              >
                Set Up My Profile
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
              </button>
              <button className="btn-secondary">
                View Demo
              </button>
            </div>

            <div style={{paddingTop:'32px', display:'flex', alignItems:'center', gap:'24px'}}>
              <div style={{display:'flex'}}>
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA_gahW__HiAphDk16tpz5aAz9b6IxDD05-dLv25g_0VKsb-oe289EKemv_z_P0bnd2oEx8K2-M3NGeD_C2kmsRZDFNmyKeaK4EChjXH3Vk6DTcgBESrk2TdoIGvXqZOGfDIuglGgyzQlGYpkla6NEr07qw_m5XPUS1a98GYmWmib7__sp1JLqzWCCcRaZmZOgt_7brq2VwUHAykEKbf2QvvtC86InAOxvVkaaA8cH7E8dVZRE_gmwb6pDYk8LrvpCdH-fA5eXu3X8',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDMERFPNMwYT1m-ToGtAwNLMEXZwT3J5fF29-PtEdsHV5w-xJzoyoLWLnW3NWxBc087Hu8-BOU7N6fmj5JyxX1bdpO50sLsaiJ5xndfoeJ-q5dzX6ekEQFGiBpYxH2AGS0QOXPsxpkuTE1sfvGCJgV0-DPObwMb08qUSFI-tCO8ViaTfRt_u0h-a2UFaFWvTuLM5PgIKWG9VbHlMgpv4hn_cSVVsOv3FxUg_ED2mHYgFFW1vE8APDUl-_Q_UVeU_B_nks7nYUvYRY',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7ZpI1KIq8RZUftHBnU1hx6W3HS0oU8ir9r1ssPQ2lZUlIBXOUolMS4GEuYYcpNj12ZeC1PxV0zXtfMluLqgPX20myR5_tNmq29L5kj2cHgKdN4vBFxAVcpHW622o-FQIUJcPhmKSWhIKEcjcZDNfglMqkzaLswP4PbVi9knpSHOSFm8jSbqUWaJIeYU1mvUHSxpmis_jslW-K_dFBqMPYCAgPOtpJdMiK_0Y98RLFqCWfCOyiidvaMU0Bv15X5hhz61YYOo0mtPU',
                ].map((src, i) => (
                  <img key={i} src={src} alt="Scholar"
                    style={{width:'40px', height:'40px', borderRadius:'50%', border:'2px solid #1a1f2f', objectFit:'cover', marginLeft: i > 0 ? '-12px' : 0}} />
                ))}
              </div>
              <p style={{fontFamily:'Inter', fontSize:'12px', color:'#8c909f', fontStyle:'italic'}}>
                Joined by 1,200+ scholars this week
              </p>
            </div>
          </section>

          {/* Right Side — Card */}
          <div style={{position:'relative'}}>
            {/* Glow border */}
            <div style={{position:'absolute', inset:'-4px', background:'linear-gradient(to right, rgba(173,198,255,0.2), rgba(107,216,203,0.2), rgba(208,188,255,0.2))', borderRadius:'16px', filter:'blur(16px)', opacity:0.5}} />

            <div className="glass-panel" style={{position:'relative', border:'1px solid rgba(66,71,84,0.15)', borderRadius:'16px', overflow:'hidden', boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>

              {/* Card Header */}
              <div style={{padding:'20px 24px', borderBottom:'1px solid rgba(66,71,84,0.1)', background:'rgba(37,41,58,0.4)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#6bd8cb', animation:'pulse 2s infinite'}} />
                  <span style={{fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.2em', color:'#6bd8cb'}}>
                    System: Ready
                  </span>
                </div>
                <span style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f'}}>
                  INITIALIZATION_v1.0.4
                </span>
              </div>

              {/* Steps */}
              <div style={{padding:'32px', display:'flex', flexDirection:'column', gap:'32px'}}>

                {/* Step 1 */}
                <div style={{display:'flex', gap:'24px', alignItems:'flex-start'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div style={{width:'40px', height:'40px', borderRadius:'8px', background:'#25293a', border:'1px solid rgba(173,198,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#adc6ff', fontWeight:700, boxShadow:'0 0 15px rgba(173,198,255,0.1)', flexShrink:0}}>
                      01
                    </div>
                    <div style={{width:'1px', height:'48px', background:'linear-gradient(to bottom, rgba(173,198,255,0.3), transparent)', marginTop:'8px'}} />
                  </div>
                  <div style={{paddingTop:'4px'}}>
                    <h3 style={{fontFamily:'Space Grotesk', fontWeight:700, fontSize:'15px', color:'#dee1f7', letterSpacing:'-0.02em', marginBottom:'4px'}}>
                      Add your skills
                    </h3>
                    <p style={{fontSize:'12px', color:'#c2c6d6', lineHeight:1.6}}>
                      Quantify your expertise. AI, Bio-tech, or Quantum computation.
                    </p>
                    <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
                      <span style={{padding:'2px 8px', background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.2)', fontSize:'10px', color:'#adc6ff', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.05em'}}>
                        Neural Nets
                      </span>
                      <span style={{padding:'2px 8px', background:'rgba(107,216,203,0.1)', border:'1px solid rgba(107,216,203,0.2)', fontSize:'10px', color:'#6bd8cb', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.05em'}}>
                        Python
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{display:'flex', gap:'24px', alignItems:'flex-start'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div style={{width:'40px', height:'40px', borderRadius:'8px', background:'#25293a', border:'1px solid rgba(208,188,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#d0bcff', fontWeight:700, flexShrink:0}}>
                      02
                    </div>
                    <div style={{width:'1px', height:'48px', background:'linear-gradient(to bottom, rgba(208,188,255,0.3), transparent)', marginTop:'8px'}} />
                  </div>
                  <div style={{paddingTop:'4px'}}>
                    <h3 style={{fontFamily:'Space Grotesk', fontWeight:700, fontSize:'15px', color:'#dee1f7', letterSpacing:'-0.02em', marginBottom:'4px'}}>
                      Write a short bio
                    </h3>
                    <p style={{fontSize:'12px', color:'#c2c6d6', lineHeight:1.6}}>
                      Define your academic persona. Let the network know what drives your curiosity.
                    </p>
                    <div style={{marginTop:'12px', width:'100%', height:'6px', background:'#161b2b', borderRadius:'999px', overflow:'hidden'}}>
                      <div style={{width:'66%', height:'100%', background:'rgba(208,188,255,0.4)'}} />
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{display:'flex', gap:'24px', alignItems:'flex-start'}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'8px', background:'#25293a', border:'1px solid rgba(107,216,203,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#6bd8cb', fontWeight:700, flexShrink:0}}>
                    03
                  </div>
                  <div style={{paddingTop:'4px'}}>
                    <h3 style={{fontFamily:'Space Grotesk', fontWeight:700, fontSize:'15px', color:'#dee1f7', letterSpacing:'-0.02em', marginBottom:'4px'}}>
                      Link your GitHub
                    </h3>
                    <p style={{fontSize:'12px', color:'#c2c6d6', lineHeight:1.6}}>
                      Synchronize your repositories to validate your technical contributions.
                    </p>
                    <div style={{marginTop:'12px', display:'flex', alignItems:'center', gap:'8px', color:'rgba(107,216,203,0.6)'}}>
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>link</span>
                      <span style={{fontFamily:'DM Mono', fontSize:'10px'}}>awaiting_connection...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data stream widget */}
              <div style={{padding:'0 32px 32px'}}>
                <div style={{padding:'16px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(66,71,84,0.1)', borderRadius:'8px', position:'relative', overflow:'hidden'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', position:'relative', zIndex:1}}>
                    <div>
                      <div style={{fontFamily:'DM Mono', fontSize:'9px', color:'#8c909f', marginBottom:'4px'}}>DATA_STREAM_ID</div>
                      <div style={{fontFamily:'DM Mono', fontSize:'12px', color:'#adc6ff', fontWeight:700, letterSpacing:'-0.02em'}}>
                        882-X90-NS-ONBOARD
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'4px', alignItems:'flex-end', height:'32px'}}>
                      {[60, 90, 40, 100, 70].map((h, i) => (
                        <div key={i} style={{width:'4px', background:`rgba(173,198,255,${0.4 + i * 0.1})`, height:`${h}%`}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chip */}
            <div className="glass-panel" style={{position:'absolute', bottom:'-24px', right:'-24px', border:'1px solid rgba(107,216,203,0.3)', padding:'16px', borderRadius:'12px', boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{position:'relative', width:'48px', height:'48px'}}>
                  <svg width="48" height="48" style={{transform:'rotate(-90deg)'}}>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(107,216,203,0.1)" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#6bd8cb" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="30" />
                  </svg>
                  <span style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Mono', fontSize:'10px', fontWeight:700, color:'#6bd8cb'}}>
                    75%
                  </span>
                </div>
                <div>
                  <div style={{fontFamily:'DM Mono', fontSize:'10px', color:'#8c909f', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.1em'}}>
                    Efficiency
                  </div>
                  <div style={{fontFamily:'Syne', fontSize:'14px', fontWeight:800, color:'#dee1f7'}}>
                    OPTIMAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'32px', opacity:0.4}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>lock</span>
            <span style={{fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', letterSpacing:'-0.02em'}}>Encrypted Link</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>verified</span>
            <span style={{fontFamily:'DM Mono', fontSize:'10px', textTransform:'uppercase', letterSpacing:'-0.02em'}}>Academic Auth</span>
          </div>
        </div>
      </main>
    </>
  )
}