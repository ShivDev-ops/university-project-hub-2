'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { NotifActions } from '@/app/notifications/NotifActions'

type NotificationItem = {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
  link?: string | null
  metadata: Record<string, any> | null
}

type ApplicationItem = {
  id: string
  status: string
  created_at: string
  updated_at?: string
  project?: {
    id: string
    title: string
    owner_id: string
  } | null
}

type NotificationsCenterProps = {
  notifications: NotificationItem[]
  applications: ApplicationItem[]
  applicationStatusById: Record<string, string>
}

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'applicants', label: 'Applicants' },
  { key: 'applied', label: 'Applied' },
  { key: 'messages', label: 'Messages' },
  { key: 'score', label: 'Score' },
  { key: 'system', label: 'System' },
]

const iconMap: Record<string, { icon: string; color: string }> = {
  application: { icon: 'description', color: '#adc6ff' },
  accepted: { icon: 'check_circle', color: '#34d399' },
  rejected: { icon: 'cancel', color: '#fb7185' },
  collaborator_left: { icon: 'logout', color: '#fbbf24' },
  message: { icon: 'chat', color: '#fbbf24' },
  score: { icon: 'star', color: '#6bd8cb' },
  ghost: { icon: 'warning', color: '#fb923c' },
  endorsed: { icon: 'thumb_up', color: '#d0bcff' },
  system: { icon: 'info', color: '#8c909f' },
}

function groupByDate(notifications: NotificationItem[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<string, NotificationItem[]> = {}

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

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationsCenter({ notifications, applications, applicationStatusById }: NotificationsCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'applicants' | 'applied' | 'messages' | 'score' | 'system'>('all')
  const [items, setItems] = useState(notifications)

  const unread = useMemo(() => items.filter(n => !n.read), [items])

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'applicants':
        return items.filter(notification => notification.type === 'application')
      case 'messages':
        return items.filter(notification => notification.type === 'message')
      case 'score':
        return items.filter(notification => ['score', 'endorsed', 'ghost'].includes(notification.type))
      case 'system':
        return items.filter(notification => ['system', 'collaborator_left'].includes(notification.type))
      case 'all':
      default:
        return items
    }
  }, [activeTab, items])

  const grouped = useMemo(() => groupByDate(filteredNotifications), [filteredNotifications])

  async function deleteNotification(notificationId: string) {
    const response = await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    if (!response.ok) return
    setItems(current => current.filter(item => item.id !== notificationId))
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid rgba(66,71,84,0.2)', marginBottom: '32px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              padding: '10px 20px',
              fontFamily: 'DM Mono',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === tab.key ? '#adc6ff' : 'rgba(194,198,214,0.5)',
              borderBottom: activeTab === tab.key ? '2px solid #adc6ff' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'applied' ? (
        applications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#424754' }}>work_outline</span>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, color: '#c2c6d6' }}>No applications yet</h3>
            <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f' }}>Your applied projects will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {applications.map((application) => {
              const status = application.status.toLowerCase()
              const cfg = status === 'accepted'
                ? { icon: 'check_circle', color: '#34d399' }
                : status === 'rejected'
                  ? { icon: 'cancel', color: '#fb7185' }
                  : { icon: 'schedule', color: '#fbbf24' }

              return (
                <div key={application.id} className="glass-panel" style={{ padding: '16px 20px', border: `1px solid ${cfg.color}25` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0, flex: 1 }}>
                      <span className="material-symbols-outlined" style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', lineHeight: 1.5, color: '#dee1f7', fontWeight: 600 }}>
                          {application.project?.title ?? 'Unknown Project'}
                        </div>
                        <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Status: {status}
                        </div>
                        <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)', marginTop: '4px' }}>
                          Applied {relativeTime(application.created_at)}
                        </div>
                      </div>
                    </div>
                    {application.project?.id && (
                      <Link href={`/projects/${application.project.id}`} style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#adc6ff', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        View Project
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : filteredNotifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#424754' }}>notifications_none</span>
          <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, color: '#c2c6d6' }}>All caught up</h3>
          <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#8c909f' }}>No notifications yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, groupedItems]) => (
          <section key={dateLabel} style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'DM Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(194,198,214,0.4)', whiteSpace: 'nowrap' }}>
                {dateLabel}
              </h2>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(66,71,84,0.3), transparent)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {groupedItems.map((notif, idx) => {
                const cfg = iconMap[notif.type] || iconMap.system
                const applicationId = notif.metadata?.application_id as string | undefined
                const applicationStatus = applicationId ? applicationStatusById[applicationId] : undefined
                const isApplication = notif.type === 'application' && applicationId
                const isActionableApplication = isApplication && applicationStatus === 'pending'
                const leaveReason = notif.type === 'collaborator_left'
                  ? (typeof notif.metadata?.reason === 'string' ? notif.metadata.reason.trim() : '')
                  : ''

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
                    {!notif.read && (
                      <div style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: '3px', height: '40px', background: cfg.color,
                        boxShadow: `0 0 8px ${cfg.color}60`,
                      }} />
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="material-symbols-outlined" style={{ color: cfg.color, fontSize: '20px' }}>{cfg.icon}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '14px', lineHeight: 1.5,
                          color: notif.read ? '#c2c6d6' : '#dee1f7',
                          fontWeight: notif.read ? 400 : 600,
                          marginBottom: '4px',
                        }}>
                          {notif.message}
                        </p>

                        {notif.type === 'collaborator_left' && leaveReason && (
                          <div style={{
                            marginTop: '10px', marginBottom: '8px',
                            padding: '10px 12px', background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.2)',
                          }}>
                            <p style={{
                              fontFamily: 'DM Mono', fontSize: '10px', color: '#fbbf24',
                              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
                            }}>
                              Exit Reason
                            </p>
                            <p style={{
                              fontFamily: 'DM Mono', fontSize: '11px', lineHeight: 1.6,
                              color: '#e8dbb5', whiteSpace: 'pre-wrap', margin: 0,
                            }}>
                              {leaveReason}
                            </p>
                          </div>
                        )}

                        <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)' }}>
                          {relativeTime(notif.created_at)}
                        </p>

                        {isApplication && !isActionableApplication && applicationStatus && applicationStatus !== 'pending' && (
                          <div style={{ marginTop: '12px', padding: '8px 12px', border: '1px solid rgba(66,71,84,0.2)', background: 'rgba(66,71,84,0.08)', fontFamily: 'DM Mono', fontSize: '10px', color: '#8c909f' }}>
                            Application already {applicationStatus}.
                          </div>
                        )}

                        {isActionableApplication && (
                          <NotifActions
                            mode="accept-reject"
                            applicationId={applicationId}
                            notifId={notif.id}
                            applicantName={notif.metadata?.applicant_name as string | undefined}
                            applicantScore={notif.metadata?.applicant_score as number | undefined}
                            applicantId={notif.metadata?.applicant_id as string | undefined}
                          />
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          title="Delete notification"
                          aria-label="Delete notification"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'transparent', border: '1px solid rgba(66,71,84,0.3)',
                            color: 'rgba(194,198,214,0.6)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>

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
        ))
      )}
    </>
  )
}
