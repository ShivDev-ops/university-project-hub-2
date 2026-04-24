'use client'
import { useState } from 'react'
import Link from 'next/link'
interface Notification {
id: string
type: string
message: string
read: boolean
created_at: string
link?: string
}
interface NotifBellProps {
notifications: Notification[]
unreadCount: number
}
export function NotifBell({ notifications, unreadCount }: NotifBellProps) {
const [open, setOpen] = useState(false)
return (
<div className="relative">
<button onClick={() => setOpen(o => !o)} className="relative p-2 rounded-lg">
{unreadCount > 0 && (
<span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16,
borderRadius: '50%', background: '#fb7185', color: '#fff',
fontSize: '9px', fontFamily: 'DM Mono', fontWeight: 700,
display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
{unreadCount > 9 ? '9+' : unreadCount}
</span>
)}
</button>
</div>
)
}