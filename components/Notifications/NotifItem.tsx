import Link from 'next/link'
interface NotifItemProps {
notification: {
id: string
type: string
message: string
read: boolean
created_at: string
link?: string
}
onMarkRead?: (id: string) => void
}
const iconMap: Record<string, { icon: string; color: string }> = {
application: { icon: 'description', color: '#10b981' },
accepted: { icon: 'check_circle', color: '#34d399' },
rejected: { icon: 'cancel', color: '#fb7185' },
message: { icon: 'chat', color: '#fbbf24' },
score: { icon: 'star', color: '#6bd8cb' },
ghost: { icon: 'warning', color: '#fb923c' },
endorsed: { icon: 'thumb_up', color: '#d0bcff' },
}
export function NotifItem({ notification, onMarkRead }: NotifItemProps) {
const cfg = iconMap[notification.type] ?? { icon: 'notifications', color: '#71717a' }
return (
<div
onClick={() => onMarkRead?.(notification.id)}
className="flex gap-3 px-5 py-4 hover:bg-[#18181b] cursor-pointer"
style={{ borderBottom: '1px solid rgba(39,39,42,0.1)' }}
>
<div className="flex-1">
<p style={{ fontSize: '13px', color: notification.read ? '#d4d4d8' : '#f4f4f5' }}>
{notification.message}
</p>
<p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'rgba(194,198,214,0.4)', marginTop: '4px' }}>
{new Date(notification.created_at).toLocaleDateString()}
</p>
</div>
</div>
)
}
