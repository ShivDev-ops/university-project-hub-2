'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  user_id: string
  full_name: string
  avatar_url: string | null
  email?: string
  score?: number
}

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: { full_name: string; avatar_url: string | null }
}

type Thread = {
  id: string
  name: string | null
  type: 'dm' | 'group' | 'team'
  team_id?: string | null
  created_at: string
  chat_members: { user_id: string; profiles: Profile }[]
  chat_messages: Message[]
}

type FriendRequest = {
  id: string
  status: string
  created_at: string
  sender: Profile | Profile[]
  receiver: Profile | Profile[]
}

type ConfirmAction =
  | { kind: 'block';   userId: string; userName: string }
  | { kind: 'unblock'; userId: string; userName: string }
  | { kind: 'clear';   threadId: string; threadName: string }

function first(val: Profile | Profile[]): Profile {
  return Array.isArray(val) ? val[0] : val
}

type Props = {
  currentUser: Profile
  initialThreads: Thread[]
  initialFriendRequests: FriendRequest[]
  /** user_ids the current user has already blocked (fetched server-side) */
  initialBlockedUsers?: string[]
  /** thread_ids the current user has muted (fetched server-side) */
  initialMutedThreads?: string[]
  session: any
}

// ─── Custom hook: track if mobile ─────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Avatar({
  src, name, size = 40, online = false, ring = false,
}: {
  src: string | null; name: string; size?: number; online?: boolean; ring?: boolean
}) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        border: ring ? '2px solid rgba(77,142,255,0.4)' : '2px solid rgba(66,71,84,0.3)',
        background: '#1a1f2f', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {src
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: 'Space Grotesk', fontSize: size * 0.36, fontWeight: 700, color: '#adc6ff' }}>{initials}</span>
        }
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1, width: 10, height: 10,
          borderRadius: '50%', background: '#6bd8cb', border: '2px solid #0e1322',
          boxShadow: '0 0 6px #6bd8cb',
        }} />
      )}
    </div>
  )
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({
  action,
  onConfirm,
  onCancel,
}: {
  action: ConfirmAction
  onConfirm: () => void
  onCancel: () => void
}) {
  const config = {
    block: {
      icon: 'block',
      title: `Block ${action.kind !== 'clear' ? action.userName : ''}?`,
      body: `${action.kind !== 'clear' ? action.userName : ''} won't be able to message you and you won't see their messages.`,
      confirmLabel: 'Block',
      confirmColor: '#ff6b6b',
      confirmBg: 'rgba(255,107,107,0.15)',
      confirmBorder: 'rgba(255,107,107,0.35)',
    },
    unblock: {
      icon: 'lock_open',
      title: `Unblock ${action.kind !== 'clear' ? action.userName : ''}?`,
      body: `${action.kind !== 'clear' ? action.userName : ''} will be able to message you again.`,
      confirmLabel: 'Unblock',
      confirmColor: '#6bd8cb',
      confirmBg: 'rgba(107,216,203,0.15)',
      confirmBorder: 'rgba(107,216,203,0.35)',
    },
    clear: {
      icon: 'delete_sweep',
      title: 'Clear chat history?',
      body: `All messages in "${action.kind === 'clear' ? action.threadName : ''}" will be permanently deleted for you. This cannot be undone.`,
      confirmLabel: 'Clear Chat',
      confirmColor: '#ffb4ab',
      confirmBg: 'rgba(255,180,171,0.15)',
      confirmBorder: 'rgba(255,180,171,0.35)',
    },
  }[action.kind]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5,8,18,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360, maxWidth: 'calc(100vw - 32px)', background: '#131828',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: 28,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: config.confirmBg,
          border: `1px solid ${config.confirmBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 26, color: config.confirmColor, fontVariationSettings: "'FILL' 1" }}>
            {config.icon}
          </span>
        </div>

        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#dee1f7', marginBottom: 10 }}>
          {config.title}
        </div>
        <div style={{ fontFamily: 'Manrope', fontSize: 13, color: '#8c909f', lineHeight: 1.6, marginBottom: 24 }}>
          {config.body}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#8c909f', fontFamily: 'DM Mono', fontSize: 12,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#dee1f7' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8c909f' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
              background: config.confirmBg, border: `1px solid ${config.confirmBorder}`,
              color: config.confirmColor, fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()
  if (sameDay) return 'Today'
  if (isYesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getThreadDisplayName(thread: Thread, currentUserId: string) {
  if (thread.name) return thread.name
  if (thread.type === 'dm') {
    const other = thread.chat_members?.find((m) => m.user_id !== currentUserId)
    return other?.profiles?.full_name ?? 'Unknown'
  }
  return 'Group Chat'
}

function getThreadAvatar(thread: Thread, currentUserId: string) {
  if (thread.type === 'dm') {
    const other = thread.chat_members?.find((m) => m.user_id !== currentUserId)
    return other?.profiles?.avatar_url ?? null
  }
  return null
}

function getDMPartner(thread: Thread, currentUserId: string): Profile | null {
  if (thread.type !== 'dm') return null
  const other = thread.chat_members?.find((m) => m.user_id !== currentUserId)
  return other?.profiles ?? null
}

function getLastMessage(thread: Thread) {
  if (!thread.chat_messages?.length) return 'No messages yet'
  const sorted = [...thread.chat_messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return sorted[0].content
}

// Thread type badge config
const BADGE_CONFIG = {
  dm:    { label: 'DM',    bg: 'rgba(107,216,203,0.1)',  border: 'rgba(107,216,203,0.25)', color: '#6bd8cb' },
  group: { label: 'Group', bg: 'rgba(208,188,255,0.1)',  border: 'rgba(208,188,255,0.25)', color: '#d0bcff' },
  team:  { label: 'Team',  bg: 'rgba(255,200,100,0.1)',  border: 'rgba(255,200,100,0.25)', color: '#ffc864' },
}

// ─── Drawer Backdrop (scoped inside component, safe from navbar) ───────────────
function DrawerBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(5,8,18,0.6)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const supabase = createClient()

export default function ChatClient({
  currentUser,
  initialThreads,
  initialFriendRequests,
  initialBlockedUsers = [],
  initialMutedThreads = [],
  session,
}: Props) {

  const isMobile = useIsMobile(768)

  const [threads, setThreads]               = useState<Thread[]>(initialThreads)
  const [activeThread, setActiveThread]     = useState<Thread | null>(initialThreads[0] ?? null)
  const [messages, setMessages]             = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput]                   = useState('')
  const [sending, setSending]               = useState(false)

  // Search
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState<Profile[]>([])
  const [searching, setSearching]           = useState(false)
  const [showSearch, setShowSearch]         = useState(false)

  // Friend requests
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests)
  const [showRequests, setShowRequests]     = useState(false)

  // Panels / menus
  const [showMembers, setShowMembers]       = useState(false)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)

  // ── Mobile drawer state ────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [membersOpen, setMembersOpen]       = useState(false)

  // Block / mute state
  const [blockedUsers, setBlockedUsers]     = useState<Set<string>>(new Set(initialBlockedUsers))
  const [mutedThreads, setMutedThreads]     = useState<Set<string>>(new Set(initialMutedThreads))

  // Confirmation modal
  const [confirmAction, setConfirmAction]   = useState<ConfirmAction | null>(null)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const searchRef       = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLTextAreaElement>(null)
  const headerMenuRef   = useRef<HTMLDivElement>(null)

  // Close mobile drawers when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
      setMembersOpen(false)
    }
  }, [isMobile])

  // Close sidebar drawer when a thread is selected on mobile
  const handleSelectThread = (thread: Thread) => {
    setActiveThread(thread)
    if (isMobile) setSidebarOpen(false)
  }

  // ── Fetch messages ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return
    setLoadingMessages(true)
    fetch(`/api/chat/threads/${activeThread.id}/messages`)
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoadingMessages(false) })
      .catch(() => setLoadingMessages(false))
  }, [activeThread?.id])

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return
    const channelName = `messages:${activeThread.id}`
    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false } } })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `thread_id=eq.${activeThread.id}`,
      }, async (payload: { new: Record<string, any> }) => {
        const msg = payload.new
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          const knownSender = prev.find((m) => m.sender_id === msg.sender_id)?.sender
          return [...prev, {
            id: msg.id, content: msg.content, created_at: msg.created_at,
            sender_id: msg.sender_id,
            sender: knownSender ?? { full_name: 'Unknown', avatar_url: null },
          }]
        })
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', msg.sender_id).single()
          .then(({ data: sd }) => {
            if (!sd) return
            setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, sender: sd } : m))
          })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeThread?.id])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Click outside: search & header menu ──────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false)
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setShowHeaderMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── User search ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeThread || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    await fetch(`/api/chat/threads/${activeThread.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSending(false)
    inputRef.current?.focus()
  }, [input, activeThread, sending])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // ── Friend request ────────────────────────────────────────────────────────
  const sendFriendRequest = async (receiverId: string) => {
    const res = await fetch('/api/friends', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId }),
    })
    if (res.ok) setSearchResults((prev) => prev.map((u) => u.user_id === receiverId ? { ...u, _requested: true } as any : u))
  }

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    await fetch('/api/friends', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    })
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
    if (action === 'accept') {
      const res = await fetch('/api/chat/threads')
      setThreads(await res.json())
    }
  }

  // ── Start DM ──────────────────────────────────────────────────────────────
  const startDM = async (userId: string) => {
    const existing = threads.find((t) => t.type === 'dm' && t.chat_members?.some((m) => m.user_id === userId))
    if (existing) { setActiveThread(existing); setShowSearch(false); setSearchQuery(''); if (isMobile) setSidebarOpen(false); return }
    const res = await fetch('/api/chat/threads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dm', memberIds: [userId] }),
    })
    if (res.ok) {
      const threadsRes = await fetch('/api/chat/threads')
      const data = await threadsRes.json()
      setThreads(data)
      const newThread = data.find((t: Thread) => t.chat_members?.some((m: any) => m.user_id === userId))
      if (newThread) setActiveThread(newThread)
      setShowSearch(false); setSearchQuery('')
      if (isMobile) setSidebarOpen(false)
    }
  }

  // ── Block / Unblock ───────────────────────────────────────────────────────
  const executeBlock = async (userId: string) => {
    await fetch('/api/users/block', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setBlockedUsers((prev) => new Set([...prev, userId]))
    setConfirmAction(null)
    setShowHeaderMenu(false)
  }

  const executeUnblock = async (userId: string) => {
    await fetch(`/api/users/block/${userId}`, { method: 'DELETE' })
    setBlockedUsers((prev) => { const n = new Set(prev); n.delete(userId); return n })
    setConfirmAction(null)
    setShowHeaderMenu(false)
  }

  // ── Mute / Unmute ─────────────────────────────────────────────────────────
  const toggleMute = async (threadId: string) => {
    const isMuted = mutedThreads.has(threadId)
    await fetch(`/api/chat/threads/${threadId}/mute`, {
      method: isMuted ? 'DELETE' : 'POST',
    })
    setMutedThreads((prev) => {
      const n = new Set(prev)
      isMuted ? n.delete(threadId) : n.add(threadId)
      return n
    })
    setShowHeaderMenu(false)
  }

  // ── Clear chat ────────────────────────────────────────────────────────────
  const executeClearChat = async (threadId: string) => {
    await fetch(`/api/chat/threads/${threadId}/messages`, { method: 'DELETE' })
    if (activeThread?.id === threadId) setMessages([])
    setConfirmAction(null)
    setShowHeaderMenu(false)
  }

  // ── Confirm dispatch ──────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.kind === 'block')   executeBlock(confirmAction.userId)
    if (confirmAction.kind === 'unblock') executeUnblock(confirmAction.userId)
    if (confirmAction.kind === 'clear')   executeClearChat(confirmAction.threadId)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const pendingIncoming = friendRequests.filter((r) => first(r.receiver)?.user_id === currentUser.user_id)
  const activeMembers   = activeThread?.chat_members ?? []
  const dmPartner       = activeThread ? getDMPartner(activeThread, currentUser.user_id) : null
  const isBlocked       = dmPartner ? blockedUsers.has(dmPartner.user_id) : false
  const isMuted         = activeThread ? mutedThreads.has(activeThread.id) : false
  const isTeamThread    = activeThread?.type === 'team'

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = []
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at)
    const last = groupedMessages[groupedMessages.length - 1]
    if (!last || last.date !== date) groupedMessages.push({ date, msgs: [msg] })
    else last.msgs.push(msg)
  })

  // ── Sidebar content (shared between desktop sidebar and mobile drawer) ─────
  const SidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Mobile drawer header */}
      {isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#adc6ff' }}>
            Conversations
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c909f',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      {/* Search bar */}
      <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} ref={searchRef}>
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: '#8c909f', pointerEvents: 'none',
          }}>search</span>
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true) }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search by name or email..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              background: 'rgba(37,41,58,0.7)', border: '1px solid rgba(66,71,84,0.3)',
              borderRadius: 10, color: '#dee1f7', fontSize: 13,
              fontFamily: 'DM Mono', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {showSearch && searchQuery.length >= 2 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
              background: '#161b2b', border: '1px solid rgba(66,71,84,0.4)',
              borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {searching && <div style={{ padding: '12px 14px', fontSize: 12, color: '#8c909f', fontFamily: 'DM Mono' }}>Searching...</div>}
              {!searching && searchResults.length === 0 && <div style={{ padding: '12px 14px', fontSize: 12, color: '#8c909f', fontFamily: 'DM Mono' }}>No users found</div>}
              {searchResults.map((user: any) => (
                <div key={user.user_id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderBottom: '1px solid rgba(66,71,84,0.2)', transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(77,142,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Avatar src={user.avatar_url} name={user.full_name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#dee1f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</div>
                    <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startDM(user.user_id)} title="Message" style={{
                      background: 'rgba(77,142,255,0.15)', border: '1px solid rgba(77,142,255,0.3)',
                      borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#adc6ff',
                      fontFamily: 'DM Mono', display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat</span>
                    </button>
                    <button onClick={() => sendFriendRequest(user.user_id)} title="Add friend" disabled={user._requested} style={{
                      background: user._requested ? 'rgba(107,216,203,0.05)' : 'rgba(107,216,203,0.15)',
                      border: `1px solid ${user._requested ? 'rgba(107,216,203,0.15)' : 'rgba(107,216,203,0.35)'}`,
                      borderRadius: 7, padding: '4px 8px', cursor: user._requested ? 'default' : 'pointer',
                      color: user._requested ? '#6bd8cb88' : '#6bd8cb',
                      fontFamily: 'DM Mono', display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{user._requested ? 'check' : 'person_add'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Friend request bell */}
      {pendingIncoming.length > 0 && (
        <div onClick={() => setShowRequests(!showRequests)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: 'rgba(77,142,255,0.07)', borderBottom: '1px solid rgba(77,142,255,0.1)', cursor: 'pointer',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#adc6ff' }}>notifications</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#adc6ff', flex: 1 }}>
            {pendingIncoming.length} friend request{pendingIncoming.length > 1 ? 's' : ''}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#adc6ff' }}>{showRequests ? 'expand_less' : 'expand_more'}</span>
        </div>
      )}

      {showRequests && pendingIncoming.map((req) => (
        <div key={req.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderBottom: '1px solid rgba(66,71,84,0.15)', background: 'rgba(77,142,255,0.04)',
        }}>
          <Avatar src={first(req.sender).avatar_url} name={first(req.sender).full_name} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#dee1f7' }}>{first(req.sender).full_name}</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f' }}>wants to connect</div>
          </div>
          <button onClick={() => respondToRequest(req.id, 'accept')} style={{
            background: 'rgba(107,216,203,0.2)', border: '1px solid rgba(107,216,203,0.3)',
            borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#6bd8cb', fontSize: 10, fontFamily: 'DM Mono',
          }}>Accept</button>
          <button onClick={() => respondToRequest(req.id, 'decline')} style={{
            background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)',
            borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#ffb4ab', fontSize: 10, fontFamily: 'DM Mono',
          }}>Decline</button>
        </div>
      ))}

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {threads.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#424754' }}>chat_bubble</span>
            <p style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#8c909f', marginTop: 8 }}>
              No conversations yet.<br />Search for a user to start chatting.
            </p>
          </div>
        ) : threads.map((thread) => {
          const isActive     = activeThread?.id === thread.id
          const displayName  = getThreadDisplayName(thread, currentUser.user_id)
          const avatarSrc    = getThreadAvatar(thread, currentUser.user_id)
          const lastMsg      = getLastMessage(thread)
          const badge        = BADGE_CONFIG[thread.type] ?? BADGE_CONFIG.group
          const partner      = getDMPartner(thread, currentUser.user_id)
          const threadBlocked = partner ? blockedUsers.has(partner.user_id) : false
          const threadMuted  = mutedThreads.has(thread.id)

          return (
            <div
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderRight: isActive ? '2px solid #adc6ff' : '2px solid transparent',
                background: isActive ? 'rgba(77,142,255,0.08)' : 'transparent',
                cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.15s',
                opacity: threadBlocked ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Team thread: shield icon instead of avatar */}
              {thread.type === 'team' ? (
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,200,100,0.1)', border: '2px solid rgba(255,200,100,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#ffc864', fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
              ) : (
                <Avatar src={avatarSrc} name={displayName} size={42} online={isActive} ring={isActive} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                    color: isActive ? '#adc6ff' : '#dee1f7',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130,
                  }}>{displayName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {threadMuted && (
                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#424754', fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
                    )}
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f' }}>
                      {thread.chat_messages?.length ? formatTime(thread.chat_messages[thread.chat_messages.length - 1]?.created_at) : ''}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'Manrope', fontSize: 12, color: threadBlocked ? '#424754' : '#8c909f',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontStyle: threadBlocked ? 'italic' : 'normal',
                }}>
                  {threadBlocked ? 'User blocked' : lastMsg}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{
                    padding: '1px 7px', borderRadius: 20, fontSize: 9, fontFamily: 'DM Mono',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                  }}>{badge.label}</span>
                  {thread.type === 'team' && thread.name && (
                    <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: '#424754', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {thread.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Members panel content (shared between desktop inline and mobile drawer) ─
  const MembersPanelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Mobile drawer header */}
      {isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#adc6ff' }}>
            Members
          </span>
          <button
            onClick={() => setMembersOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c909f',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      {!isMobile && (
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Members — {activeMembers.length}
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {activeMembers.map((member: any) => {
          const isMe = member.user_id === currentUser.user_id
          return (
            <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }}>
              <Avatar src={member.profiles?.avatar_url} name={member.profiles?.full_name ?? 'U'} size={32} online={isMe} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
                  color: isMe ? '#adc6ff' : '#dee1f7',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {member.profiles?.full_name ?? 'Unknown'}{isMe ? ' (you)' : ''}
                </div>
                {member.profiles?.score != null && (
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#6bd8cb' }}>★ {member.profiles.score}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add member button — only for group chats */}
      {activeThread?.type === 'group' && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button style={{
            width: '100%', padding: '8px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(107,216,203,0.1)', border: '1px solid rgba(107,216,203,0.2)',
            color: '#6bd8cb', fontFamily: 'DM Mono', fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
            Add Member
          </button>
        </div>
      )}

      {/* Team: explain auto-managed membership */}
      {activeThread?.type === 'team' && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#424754', textAlign: 'center', lineHeight: 1.6 }}>
            Members are managed automatically through team settings.
          </p>
        </div>
      )}
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Global keyframe styles */}
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInLeft  { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        @keyframes slideInRight { from { transform:translateX(100%) }  to { transform:translateX(0) } }
      `}</style>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ── DESKTOP: Thread Sidebar (always visible) ────────────────────── */}
      {!isMobile && (
        <div style={{
          width: 300, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(9,14,28,0.6)', backdropFilter: 'blur(12px)', flexShrink: 0,
        }}>
          {SidebarContent}
        </div>
      )}

      {/* ── MOBILE: Thread Sidebar Drawer ───────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <>
          <DrawerBackdrop onClose={() => setSidebarOpen(false)} />
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 60,
            width: '80%', maxWidth: 300,
            display: 'flex', flexDirection: 'column',
            background: 'rgba(9,14,28,0.98)', backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
            animation: 'slideInLeft 0.25s cubic-bezier(0.34,1.1,0.64,1)',
          }}>
            {SidebarContent}
          </div>
        </>
      )}

      {/* ── MOBILE: Members Drawer ──────────────────────────────────────── */}
      {isMobile && membersOpen && (
        <>
          <DrawerBackdrop onClose={() => setMembersOpen(false)} />
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 60,
            width: '75%', maxWidth: 260,
            display: 'flex', flexDirection: 'column',
            background: 'rgba(9,14,28,0.98)', backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.5)',
            animation: 'slideInRight 0.25s cubic-bezier(0.34,1.1,0.64,1)',
          }}>
            {MembersPanelContent}
          </div>
        </>
      )}

      {/* ── Main Chat Area ──────────────────────────────────────────────── */}
      {!activeThread ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#424754' }}>
          {/* Mobile: hamburger to open sidebar when no thread selected */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(77,142,255,0.12)', border: '1px solid rgba(77,142,255,0.25)',
                borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adc6ff',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
            </button>
          )}
          <span className="material-symbols-outlined" style={{ fontSize: 56 }}>forum</span>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#c2c6d6', marginTop: 16 }}>Select a conversation</p>
          <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f', marginTop: 6, textAlign: 'center', padding: '0 24px' }}>
            {isMobile ? 'Tap the menu icon to see your chats' : 'or search for a user to start chatting'}
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* ── Chat Header ──────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '0 12px' : '0 20px', height: 60, flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(14,19,34,0.8)', backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>

              {/* Mobile: hamburger to open sidebar */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, width: 34, height: 34, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c909f',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu</span>
                </button>
              )}

              {isTeamThread ? (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,200,100,0.1)', border: '2px solid rgba(255,200,100,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ffc864', fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
              ) : (
                <Avatar src={getThreadAvatar(activeThread, currentUser.user_id)} name={getThreadDisplayName(activeThread, currentUser.user_id)} size={36} online />
              )}

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                  <span style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700,
                    fontSize: isMobile ? 13 : 15,
                    color: isTeamThread ? '#ffc864' : '#adc6ff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    maxWidth: isMobile ? 120 : 220,
                  }}>
                    {getThreadDisplayName(activeThread, currentUser.user_id)}
                  </span>
                  {isMuted && (
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#424754', fontVariationSettings: "'FILL' 1", flexShrink: 0 }} title="Muted">notifications_off</span>
                  )}
                  {isBlocked && (
                    <span style={{
                      fontFamily: 'DM Mono', fontSize: 9, padding: '2px 7px', borderRadius: 20,
                      background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
                      color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                    }}>Blocked</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isTeamThread ? '#ffc864' : '#6bd8cb', boxShadow: `0 0 6px ${isTeamThread ? '#ffc864' : '#6bd8cb'}`, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: isTeamThread ? '#ffc864' : '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    {activeThread.type === 'dm' ? 'Direct Message' : `${activeMembers.length} Members`}
                  </span>
                </div>
              </div>
            </div>

            {/* Header action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>

              {/* Desktop: full Members button / Mobile: icon only that opens members drawer */}
              {isMobile ? (
                <button
                  onClick={() => setMembersOpen(true)}
                  title="Members"
                  style={{
                    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                    background: membersOpen ? 'rgba(77,142,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: membersOpen ? '1px solid rgba(77,142,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: membersOpen ? '#adc6ff' : '#8c909f',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>group</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 8, cursor: 'pointer',
                    background: showMembers ? 'rgba(77,142,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: showMembers ? '1px solid rgba(77,142,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    color: showMembers ? '#adc6ff' : '#8c909f', fontFamily: 'DM Mono', fontSize: 11, transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
                  Members ({activeMembers.length})
                </button>
              )}

              {/* ⋯ More options */}
              <div style={{ position: 'relative' }} ref={headerMenuRef}>
                <button
                  onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                  title="More options"
                  style={{
                    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                    background: showHeaderMenu ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#8c909f', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#dee1f7' }}
                  onMouseLeave={(e) => { if (!showHeaderMenu) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8c909f' } }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
                </button>

                {/* Dropdown */}
                {showHeaderMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                    background: '#131828', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    minWidth: 200,
                    animation: 'modalIn 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>
                    {/* Mute / Unmute — available for all thread types */}
                    <MenuButton
                      icon={isMuted ? 'notifications' : 'notifications_off'}
                      label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                      color={isMuted ? '#adc6ff' : '#8c909f'}
                      onClick={() => toggleMute(activeThread.id)}
                    />

                    {/* Block / Unblock — DM only, not team */}
                    {activeThread.type === 'dm' && dmPartner && (
                      <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                        <MenuButton
                          icon={isBlocked ? 'lock_open' : 'block'}
                          label={isBlocked ? `Unblock ${dmPartner.full_name}` : `Block ${dmPartner.full_name}`}
                          color={isBlocked ? '#6bd8cb' : '#ff6b6b'}
                          onClick={() => {
                            setShowHeaderMenu(false)
                            setConfirmAction(isBlocked
                              ? { kind: 'unblock', userId: dmPartner.user_id, userName: dmPartner.full_name }
                              : { kind: 'block',   userId: dmPartner.user_id, userName: dmPartner.full_name }
                            )
                          }}
                        />
                      </>
                    )}

                    {/* Clear Chat — not for team threads */}
                    {!isTeamThread && (
                      <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                        <MenuButton
                          icon="delete_sweep"
                          label="Clear chat history"
                          color="#ffb4ab"
                          onClick={() => {
                            setShowHeaderMenu(false)
                            setConfirmAction({
                              kind: 'clear',
                              threadId: activeThread.id,
                              threadName: getThreadDisplayName(activeThread, currentUser.user_id),
                            })
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Blocked banner ─────────────────────────────────────────── */}
          {isBlocked && (
            <div style={{
              padding: '8px 20px', background: 'rgba(255,107,107,0.06)',
              borderBottom: '1px solid rgba(255,107,107,0.12)',
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ff6b6b', fontVariationSettings: "'FILL' 1" }}>block</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#ff6b6b', flex: 1, minWidth: 0 }}>
                You've blocked {dmPartner?.full_name}. They cannot send you messages.
              </span>
              <button
                onClick={() => setConfirmAction({ kind: 'unblock', userId: dmPartner!.user_id, userName: dmPartner!.full_name })}
                style={{
                  marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: 6, padding: '2px 10px', cursor: 'pointer', color: '#ff6b6b',
                  fontFamily: 'DM Mono', fontSize: 10, flexShrink: 0,
                }}
              >Unblock</button>
            </div>
          )}

          {/* ── Team info banner ───────────────────────────────────────── */}
          {isTeamThread && (
            <div style={{
              padding: '7px 20px', background: 'rgba(255,200,100,0.05)',
              borderBottom: '1px solid rgba(255,200,100,0.1)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffc864', fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#ffc864' }}>
                Team chat — members are added and removed automatically with team membership.
              </span>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Messages area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px' : '20px 24px' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f' }}>Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#424754' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48 }}>chat_bubble_outline</span>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f', marginTop: 12 }}>
                      {isTeamThread ? 'Team chat is empty. Say hello to the team!' : 'No messages yet. Say hello!'}
                    </p>
                  </div>
                ) : groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                      <span style={{
                        fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                        padding: '3px 10px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20,
                      }}>{date}</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    {msgs.map((msg) => {
                      const isOwn = msg.sender_id === currentUser.user_id
                      return (
                        <div key={msg.id} style={{
                          display: 'flex', gap: 10, marginBottom: 16,
                          flexDirection: isOwn ? 'row-reverse' : 'row',
                        }}>
                          {!isOwn && <Avatar src={msg.sender?.avatar_url} name={msg.sender?.full_name ?? 'U'} size={isMobile ? 28 : 32} />}
                          <div style={{ maxWidth: isMobile ? '82%' : '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                            {!isOwn && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#c2c6d6' }}>
                                  {msg.sender?.full_name ?? 'Unknown'}
                                </span>
                                <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f' }}>{formatTime(msg.created_at)}</span>
                              </div>
                            )}
                            <div style={{
                              padding: isMobile ? '8px 12px' : '10px 14px',
                              borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                              background: isOwn ? 'rgba(77,142,255,0.18)' : 'rgba(37,41,58,0.8)',
                              border: isOwn ? '1px solid rgba(77,142,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                              backdropFilter: 'blur(8px)', fontSize: isMobile ? 13 : 14, lineHeight: 1.55,
                              color: '#dee1f7', fontFamily: 'Manrope',
                              boxShadow: isOwn ? '0 0 20px rgba(77,142,255,0.06)' : 'none',
                            }}>{msg.content}</div>
                            {isOwn && (
                              <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', marginTop: 4 }}>{formatTime(msg.created_at)}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input — hidden when blocked */}
              {isBlocked ? (
                <div style={{
                  padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,107,107,0.04)',
                }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#424754' }}>
                    Unblock this user to send messages.
                  </span>
                </div>
              ) : (
                <div style={{ padding: isMobile ? '0 12px 14px' : '0 20px 20px', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-end', gap: 8,
                    background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
                    padding: '8px 8px 8px 14px', transition: 'border-color 0.2s',
                  }}>
                    {!isMobile && (
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                        color: '#8c909f', borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#adc6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#8c909f')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>attach_file</span>
                      </button>
                    )}
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isMuted ? 'Notifications muted — Type a message...' : 'Type a message...'}
                      rows={1}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        color: '#dee1f7', fontSize: isMobile ? 15 : 14, fontFamily: 'Manrope', lineHeight: 1.5,
                        resize: 'none', maxHeight: 120, padding: '6px 0',
                      }}
                      onInput={(e) => {
                        const t = e.currentTarget
                        t.style.height = 'auto'
                        t.style.height = Math.min(t.scrollHeight, 120) + 'px'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      style={{
                        width: 38, height: 38, borderRadius: 10, border: 'none',
                        cursor: input.trim() ? 'pointer' : 'default',
                        background: input.trim() ? '#4d8eff' : 'rgba(77,142,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: input.trim() ? '0 0 16px rgba(77,142,255,0.4)' : 'none',
                        transition: 'all 0.2s', flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{
                        fontSize: 18, color: input.trim() ? '#fff' : '#8c909f',
                        fontVariationSettings: "'FILL' 1",
                      }}>send</span>
                    </button>
                  </div>
                  {!isMobile && (
                    <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#424754', marginTop: 6, textAlign: 'center' }}>
                      Enter to send · Shift+Enter for new line
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── DESKTOP: Members panel inline ──────────────────────── */}
            {!isMobile && showMembers && (
              <div style={{
                width: 220, borderLeft: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(9,14,28,0.5)', backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {MembersPanelContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Small helper: dropdown menu button ──────────────────────────────────────
function MenuButton({
  icon, label, color = '#dee1f7', onClick,
}: { icon: string; label: string; color?: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 14px', background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: 'none', cursor: 'pointer', color, fontFamily: 'DM Mono', fontSize: 12,
        textAlign: 'left', transition: 'background 0.12s',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16, color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      {label}
    </button>
  )
}