// app/notifications/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NotifActions } from './NotifActions'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getNotifications(userId: string) {
  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(60)

  return data || []
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(notifications: any[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<string, any[]> = {}

  for (const n of notifications) {
    const d = new Date(n.created_at)
    d.setHours(0, 0, 0, 0)
    let label: string
    if (d.getTime() === today.getTime()) label = 'Today'
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }

  return groups
}

const iconMap: Record<string, { icon: string; color: string }> = {
  application: { icon: 'description',  color: '#adc6ff' },
  accepted:    { icon: 'check_circle', color: '#34d399' },
  rejected:    { icon: 'cancel',       color: '#fb7185' },
  message:     { icon: 'chat',         color: '#fbbf24' },
  score:       { icon: 'star',         color: '#6bd8cb' },
  ghost:       { icon: 'warning',      color: '#fb923c' },
  endorsed:    { icon: 'thumb_up',     color: '#d0bcff' },
  system:      { icon: 'info',         color: '#8c909f' },
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/api/auth/signin')

  const notifications = await getNotifications(session.user.id)
  const unread = notifications.filter(n => !n.read)
  const grouped = groupByDate(notifications)

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, avatar_url, score')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; margin: 0; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { background: rgba(26,31,47,0.7); backdrop-filter: blur(16px); }
        .dot-grid { background-image: radial-gradient(circle, rgba(77,142,255,0.05) 1px, transparent 1px); background-size: 24px 24px; }
        .notif-badge { position: absolute; top: 2px; right: 2px; min-width: 16px; height: 16px; border-radius: 999px; background: #fb7185; color: #fff; font-size: 9px; font-family: 'DM Mono', monospace; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
        .notif-row { transition: all 0.15s; }
        .notif-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.3s ease forwards; }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen dot-grid overflow-x-hidden">

        {/* ── Navbar ── */}
        <DashboardNavbar profile={profile} />

        <div className="flex pt-[60px] min-h-screen">

          {/* ── Sidebar ── */}
          <DashboardSidebar profile={profile} session={session} />

          {/* ── Main Content ── */}
          <main className="md:ml-64 w-full p-6 lg:p-10 overflow-y-auto custom-scrollbar">
            <div style={{ padding: '40px', maxWidth: '760px', margin: '0 auto' }}>

              {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontFamily: 'Syne', fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', color: '#dee1f7', marginBottom: '4px', textTransform: 'uppercase' }}>
                  System <span style={{ color: '#adc6ff' }}>Updates</span>
                </h1>
                <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'rgba(194,198,214,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  {unread.length} unread · {notifications.length} total
                </p>
              </div>
              {unread.length > 0 && (
                <NotifActions mode="mark-all" />
              )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid rgba(66,71,84,0.2)', marginBottom: '32px', overflowX: 'auto' }}>
              {['All', 'Applications', 'Messages', 'Score', 'System'].map((tab, i) => (
                <button key={tab} style={{
                  padding: '10px 20px', fontFamily: 'DM Mono', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  color: i === 0 ? '#adc6ff' : 'rgba(194,198,214,0.5)',
                  borderBottom: i === 0 ? '2px solid #adc6ff' : '2px solid transparent',
                  marginBottom: '-1px',
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {notifications.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#424754' }}>notifications_none</span>
                <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, color: '#c2c6d6' }}>All caught up</h3>
                <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f' }}>No notifications yet.</p>
              </div>
            )}

            {/* Grouped notifications */}
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <section key={dateLabel} style={{ marginBottom: '36px' }}>
                {/* Date divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <h2 style={{ fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(194,198,214,0.4)', whiteSpace: 'nowrap' }}>
                    {dateLabel}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(66,71,84,0.3), transparent)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map((notif: any, idx: number) => {
                    const cfg = iconMap[notif.type] || iconMap.system
                    const isApplication = notif.type === 'application' && notif.metadata?.application_id

                    return (
                      <div
                        key={notif.id}
                        className="notif-row slide-in glass-panel"
                        style={{
                          border: notif.read ? '1px solid rgba(66,71,84,0.12)' : `1px solid ${cfg.color}25`,
                          padding: '16px 20px',
                          position: 'relative',
                          animationDelay: `${idx * 40}ms`,
                        }}
                      >
                        {/* Unread indicator */}
                        {!notif.read && (
                          <div style={{
                            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                            width: '3px', height: '40px', background: cfg.color,
                            boxShadow: `0 0 8px ${cfg.color}60`,
                          }} />
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          {/* Icon */}
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                            background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span className="material-symbols-outlined" style={{ color: cfg.color, fontSize: '20px' }}>{cfg.icon}</span>
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: '14px', lineHeight: 1.5,
                              color: notif.read ? '#c2c6d6' : '#dee1f7',
                              fontWeight: notif.read ? 400 : 600,
                              marginBottom: '4px',
                            }}>
                              {notif.message}
                            </p>
                            <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                              {relativeTime(notif.created_at)}
                            </p>

                            {/* Accept / Reject inline actions for application notifications */}
                            {isApplication && (
                              <NotifActions
                                mode="accept-reject"
                                applicationId={notif.metadata.application_id}
                                notifId={notif.id}
                                applicantName={notif.metadata.applicant_name}
                                applicantScore={notif.metadata.applicant_score}
                              />
                            )}
                          </div>

                          {/* Right side: unread dot + chevron */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {!notif.read && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                            )}
                            {notif.link && (
                              <Link href={notif.link}>
                                <span
                                  className="material-symbols-outlined hover:text-[#adc6ff] transition-colors"
                                  style={{ color: 'rgba(194,198,214,0.3)', fontSize: '18px', cursor: 'pointer' }}
                                >
                                  chevron_right
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>
        </div>
      </div>
    </>
  )
}