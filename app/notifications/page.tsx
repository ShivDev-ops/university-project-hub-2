// app/notifications/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NotifActions } from './NotifActions'
import { NotificationsCenter } from '@/components/Notifications/NotificationsCenter'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getNotifications(userIds: string[]) {
  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(60)

  return data || []
}

async function getApplicationStatusMap(applicationIds: string[]) {
  if (applicationIds.length === 0) return new Map<string, string>()

  const { data } = await supabaseAdmin
    .from('applications')
    .select('id, status')
    .in('id', applicationIds)

  return new Map((data || []).map((application: { id: string; status: string }) => [application.id, application.status]))
}

async function getAppliedApplications(userIds: string[]) {
  if (userIds.length === 0) return []

  const { data } = await supabaseAdmin
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      project:projects!applications_project_id_fkey (
        id,
        title,
        owner_id
      )
    `)
    .in('applicant_id', userIds)
    .order('created_at', { ascending: false })

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
  collaborator_left: { icon: 'logout', color: '#fbbf24' },
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

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, score')
    .eq('user_id', session.user.id)
    .single()

  const notifications = profile
    ? await getNotifications([profile.user_id, profile.id])
    : []

  const appliedApplications = profile
    ? await getAppliedApplications([profile.user_id, profile.id])
    : []

  const applicationIds = Array.from(
    new Set(
      notifications
        .filter(notification => notification.type === 'application' && notification.metadata?.application_id)
        .map(notification => notification.metadata.application_id as string)
    )
  )

  const applicationStatusMap = await getApplicationStatusMap(applicationIds)
  const applicationStatusById = Object.fromEntries(
    Array.from(applicationStatusMap.entries())
  )

  const unread = notifications.filter(n => !n.read)

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

            <NotificationsCenter
              notifications={notifications as any}
              applications={appliedApplications as any}
              applicationStatusById={applicationStatusById}
            />
          </div>
        </main>
        </div>
      </div>
    </>
  )
}