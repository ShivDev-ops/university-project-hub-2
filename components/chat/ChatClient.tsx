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
  type: 'dm' | 'group'
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

// Supabase joins return arrays even for to-one relations — normalize safely
function first(val: Profile | Profile[]): Profile {
  return Array.isArray(val) ? val[0] : val
}

type Props = {
  currentUser: Profile
  initialThreads: Thread[]
  initialFriendRequests: FriendRequest[]
  session: any
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = 40,
  online = false,
  ring = false,
}: {
  src: string | null
  name: string
  size?: number
  online?: boolean
  ring?: boolean
}) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: ring ? '2px solid rgba(77,142,255,0.4)' : '2px solid rgba(66,71,84,0.3)',
          background: '#1a1f2f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {src ? (
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Space Grotesk', fontSize: size * 0.36, fontWeight: 700, color: '#adc6ff' }}>
            {initials}
          </span>
        )}
      </div>
      {online && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#6bd8cb',
            border: '2px solid #0e1322',
            boxShadow: '0 0 6px #6bd8cb',
          }}
        />
      )}
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  // Use 24h format — no AM/PM means no locale casing mismatch between server and client
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  // Compare dates using UTC to avoid timezone shifts between server and client
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  if (sameDay) return 'Today'
  if (isYesterday) return 'Yesterday'
  // Use fixed locale to prevent server/client mismatch
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

function getLastMessage(thread: Thread) {
  if (!thread.chat_messages?.length) return 'No messages yet'
  const sorted = [...thread.chat_messages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return sorted[0].content
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Use project's existing Supabase browser client (handles auth session automatically)
const supabase = createClient()

export default function ChatClient({ currentUser, initialThreads, initialFriendRequests, session }: Props) {

  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [activeThread, setActiveThread] = useState<Thread | null>(initialThreads[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Friend requests
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests)
  const [showRequests, setShowRequests] = useState(false)

  // Members panel
  const [showMembers, setShowMembers] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Fetch messages when thread changes ────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return
    setLoadingMessages(true)
    fetch(`/api/chat/threads/${activeThread.id}/messages`)
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoadingMessages(false) })
      .catch(() => setLoadingMessages(false))
  }, [activeThread?.id])

  // ── Supabase Realtime subscription ───────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return

    const channelName = `messages:${activeThread.id}`

    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false } } })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`,
        },
        async (payload: { new: Record<string, any> }) => {
          const msg = payload.new

          // Deduplicate — sender already sees their own message via optimistic update
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev

            // Try to find sender in existing messages to avoid extra fetch
            const knownSender = prev.find((m) => m.sender_id === msg.sender_id)?.sender
            const enriched: Message = {
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
              sender: knownSender ?? { full_name: 'Unknown', avatar_url: null },
            }
            return [...prev, enriched]
          })

          // Fetch sender info async if not known
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', msg.sender_id)
            .single()
            .then(({ data: senderData }) => {
              if (!senderData) return
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msg.id ? { ...m, sender: senderData } : m
                )
              )
            })
        }
      )
      .subscribe((status) => {
        console.log(`Realtime [${channelName}]:`, status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeThread?.id])

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Click outside search ─────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── User search ──────────────────────────────────────────────────────────
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

  // ── Send message ─────────────────────────────────────────────────────────
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

  // ── Send friend request ──────────────────────────────────────────────────
  const sendFriendRequest = async (receiverId: string) => {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId }),
    })
    if (res.ok) {
      // Optimistically mark in results
      setSearchResults((prev) => prev.map((u) => u.user_id === receiverId ? { ...u, _requested: true } as any : u))
    }
  }

  // ── Respond to friend request ────────────────────────────────────────────
  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    })
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
    if (action === 'accept') {
      // Refresh threads
      const res = await fetch('/api/chat/threads')
      const data = await res.json()
      setThreads(data)
    }
  }

  // ── Start DM ─────────────────────────────────────────────────────────────
  const startDM = async (userId: string) => {
    // Check if DM thread already exists
    const existing = threads.find(
      (t) => t.type === 'dm' && t.chat_members?.some((m) => m.user_id === userId)
    )
    if (existing) { setActiveThread(existing); setShowSearch(false); setSearchQuery(''); return }

    const res = await fetch('/api/chat/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dm', memberIds: [userId] }),
    })
    if (res.ok) {
      const threadsRes = await fetch('/api/chat/threads')
      const data = await threadsRes.json()
      setThreads(data)
      const newThread = data.find((t: Thread) => t.chat_members?.some((m: any) => m.user_id === userId))
      if (newThread) setActiveThread(newThread)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const pendingIncoming = friendRequests.filter((r) => first(r.receiver)?.user_id === currentUser.user_id)
  const activeMembers = activeThread?.chat_members ?? []

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = []
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at)
    const last = groupedMessages[groupedMessages.length - 1]
    if (!last || last.date !== date) groupedMessages.push({ date, msgs: [msg] })
    else last.msgs.push(msg)
  })

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>

      {/* ── Thread Sidebar ──────────────────────────────────────────────── */}
      <div style={{
        width: 300,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(9,14,28,0.6)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        {/* Search bar */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} ref={searchRef}>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, color: '#8c909f', pointerEvents: 'none'
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
            {/* Search dropdown */}
            {showSearch && searchQuery.length >= 2 && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                background: '#161b2b', border: '1px solid rgba(66,71,84,0.4)',
                borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {searching && (
                  <div style={{ padding: '12px 14px', fontSize: 12, color: '#8c909f', fontFamily: 'DM Mono' }}>
                    Searching...
                  </div>
                )}
                {!searching && searchResults.length === 0 && (
                  <div style={{ padding: '12px 14px', fontSize: 12, color: '#8c909f', fontFamily: 'DM Mono' }}>
                    No users found
                  </div>
                )}
                {searchResults.map((user: any) => (
                  <div key={user.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderBottom: '1px solid rgba(66,71,84,0.2)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(77,142,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Avatar src={user.avatar_url} name={user.full_name} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#dee1f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startDM(user.user_id)}
                        title="Message"
                        style={{
                          background: 'rgba(77,142,255,0.15)', border: '1px solid rgba(77,142,255,0.3)',
                          borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#adc6ff', fontSize: 11,
                          fontFamily: 'DM Mono', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat</span>
                      </button>
                      <button
                        onClick={() => sendFriendRequest(user.user_id)}
                        title="Add friend"
                        disabled={user._requested}
                        style={{
                          background: user._requested ? 'rgba(107,216,203,0.05)' : 'rgba(107,216,203,0.15)',
                          border: `1px solid ${user._requested ? 'rgba(107,216,203,0.15)' : 'rgba(107,216,203,0.35)'}`,
                          borderRadius: 7, padding: '4px 8px', cursor: user._requested ? 'default' : 'pointer',
                          color: user._requested ? '#6bd8cb88' : '#6bd8cb', fontSize: 11,
                          fontFamily: 'DM Mono', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                          {user._requested ? 'check' : 'person_add'}
                        </span>
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
          <div
            onClick={() => setShowRequests(!showRequests)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'rgba(77,142,255,0.07)', borderBottom: '1px solid rgba(77,142,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#adc6ff' }}>notifications</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#adc6ff', flex: 1 }}>
              {pendingIncoming.length} friend request{pendingIncoming.length > 1 ? 's' : ''}
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#adc6ff' }}>
              {showRequests ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        )}

        {/* Pending requests list */}
        {showRequests && pendingIncoming.map((req) => (
          <div key={req.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderBottom: '1px solid rgba(66,71,84,0.15)', background: 'rgba(77,142,255,0.04)',
          }}>
            <Avatar src={first(req.sender).avatar_url} name={first(req.sender).full_name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#dee1f7' }}>
                {first(req.sender).full_name}
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f' }}>wants to connect</div>
            </div>
            <button onClick={() => respondToRequest(req.id, 'accept')} style={{
              background: 'rgba(107,216,203,0.2)', border: '1px solid rgba(107,216,203,0.3)',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#6bd8cb', fontSize: 10,
              fontFamily: 'DM Mono',
            }}>Accept</button>
            <button onClick={() => respondToRequest(req.id, 'decline')} style={{
              background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#ffb4ab', fontSize: 10,
              fontFamily: 'DM Mono',
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
            const isActive = activeThread?.id === thread.id
            const displayName = getThreadDisplayName(thread, currentUser.user_id)
            const avatarSrc = getThreadAvatar(thread, currentUser.user_id)
            const lastMsg = getLastMessage(thread)
            return (
              <div
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRight: isActive ? '2px solid #adc6ff' : '2px solid transparent',
                  background: isActive ? 'rgba(77,142,255,0.08)' : 'transparent',
                  cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <Avatar src={avatarSrc} name={displayName} size={42} online={isActive} ring={isActive} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                      color: isActive ? '#adc6ff' : '#dee1f7',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140,
                    }}>{displayName}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', flexShrink: 0 }}>
                      {thread.chat_messages?.length ? formatTime(thread.chat_messages[thread.chat_messages.length - 1]?.created_at) : ''}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'Manrope', fontSize: 12, color: '#8c909f',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{lastMsg}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{
                      padding: '1px 7px', borderRadius: 20, fontSize: 9, fontFamily: 'DM Mono',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: thread.type === 'dm' ? 'rgba(107,216,203,0.1)' : 'rgba(208,188,255,0.1)',
                      border: thread.type === 'dm' ? '1px solid rgba(107,216,203,0.25)' : '1px solid rgba(208,188,255,0.25)',
                      color: thread.type === 'dm' ? '#6bd8cb' : '#d0bcff',
                    }}>{thread.type === 'dm' ? 'DM' : 'Group'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────────────────────────── */}
      {!activeThread ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#424754',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56 }}>forum</span>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#c2c6d6', marginTop: 16 }}>
            Select a conversation
          </p>
          <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f', marginTop: 6 }}>
            or search for a user to start chatting
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Chat header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: 60, flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(14,19,34,0.8)', backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar
                src={getThreadAvatar(activeThread, currentUser.user_id)}
                name={getThreadDisplayName(activeThread, currentUser.user_id)}
                size={36}
                online
              />
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#adc6ff' }}>
                  {getThreadDisplayName(activeThread, currentUser.user_id)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6bd8cb', boxShadow: '0 0 6px #6bd8cb', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#6bd8cb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {activeThread.type === 'dm' ? 'Direct Message' : `${activeMembers.length} Members`}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowMembers(!showMembers)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                  background: showMembers ? 'rgba(77,142,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: showMembers ? '1px solid rgba(77,142,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  color: showMembers ? '#adc6ff' : '#8c909f', fontFamily: 'DM Mono', fontSize: 11,
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
                Members ({activeMembers.length})
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Messages area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f' }}>Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#424754' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48 }}>chat_bubble_outline</span>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8c909f', marginTop: 12 }}>No messages yet. Say hello!</p>
                  </div>
                ) : groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    {/* Date divider */}
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
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex', gap: 10, marginBottom: 16,
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                          }}
                        >
                          {!isOwn && (
                            <Avatar src={msg.sender?.avatar_url} name={msg.sender?.full_name ?? 'U'} size={32} />
                          )}
                          <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                            {!isOwn && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#c2c6d6' }}>
                                  {msg.sender?.full_name ?? 'Unknown'}
                                </span>
                                <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f' }}>
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            )}
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                              background: isOwn
                                ? 'rgba(77,142,255,0.18)'
                                : 'rgba(37,41,58,0.8)',
                              border: isOwn
                                ? '1px solid rgba(77,142,255,0.25)'
                                : '1px solid rgba(255,255,255,0.06)',
                              backdropFilter: 'blur(8px)',
                              fontSize: 14, lineHeight: 1.55, color: '#dee1f7',
                              fontFamily: 'Manrope',
                              boxShadow: isOwn ? '0 0 20px rgba(77,142,255,0.06)' : 'none',
                            }}>
                              {msg.content}
                            </div>
                            {isOwn && (
                              <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', marginTop: 4 }}>
                                {formatTime(msg.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div style={{ padding: '0 20px 20px', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-end', gap: 8,
                  background: 'rgba(26,31,47,0.7)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
                  padding: '8px 8px 8px 14px', transition: 'border-color 0.2s',
                }}>
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                    color: '#8c909f', borderRadius: 8, display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#adc6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8c909f')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>attach_file</span>
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: '#dee1f7', fontSize: 14, fontFamily: 'Manrope', lineHeight: 1.5,
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
                      width: 38, height: 38, borderRadius: 10, border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                      background: input.trim() ? '#4d8eff' : 'rgba(77,142,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: input.trim() ? '0 0 16px rgba(77,142,255,0.4)' : 'none',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{
                      fontSize: 18,
                      color: input.trim() ? '#fff' : '#8c909f',
                      fontVariationSettings: "'FILL' 1",
                    }}>send</span>
                  </button>
                </div>
                <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#424754', marginTop: 6, textAlign: 'center' }}>
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>

            {/* Members panel */}
            {showMembers && (
              <div style={{
                width: 220, borderLeft: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(9,14,28,0.5)', backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Members — {activeMembers.length}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                  {activeMembers.map((member: any) => {
                    const isMe = member.user_id === currentUser.user_id
                    return (
                      <div key={member.user_id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                      }}>
                        <Avatar
                          src={member.profiles?.avatar_url}
                          name={member.profiles?.full_name ?? 'U'}
                          size={32}
                          online={isMe}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
                            color: isMe ? '#adc6ff' : '#dee1f7',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {member.profiles?.full_name ?? 'Unknown'}{isMe ? ' (you)' : ''}
                          </div>
                          {member.profiles?.score != null && (
                            <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#6bd8cb' }}>
                              ★ {member.profiles.score}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {activeThread.type === 'group' && (
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}