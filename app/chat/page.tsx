// app/chat/page.tsx
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import DashboardNavbar from '@/components/DashboardNavbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import ChatClient from '@/components/chat/ChatClient'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, score, skills, avatar_url, email')
    .eq('user_id', session.user.id)
    .single()

  // Guard: if profile is null, user has no profile row yet
  if (!profile) redirect('/login')

  // Fetch threads where current user is a member
  const { data: memberRows } = await supabaseAdmin
    .from('chat_members')
    .select('thread_id')
    .eq('user_id', session.user.id)

  const threadIds = (memberRows ?? []).map((r: any) => r.thread_id)

  let threads: any[] = []
  if (threadIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('chat_threads')
      .select(`
        id, name, type, created_at,
        chat_members ( user_id, profiles ( full_name, avatar_url, score ) ),
        chat_messages ( id, content, created_at, sender_id )
      `)
      .in('id', threadIds)
      .order('created_at', { ascending: false })
    threads = data ?? []
  }

  // Fetch pending friend requests
  const { data: friendRequests } = await supabaseAdmin
    .from('friend_requests')
    .select(`
      id, status, created_at,
      sender:sender_id ( user_id, full_name, avatar_url ),
      receiver:receiver_id ( user_id, full_name, avatar_url )
    `)
    .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
    .eq('status', 'pending')

  // Normalize: Supabase returns joined rows as arrays even for to-one relations
  const normalizedRequests = (friendRequests ?? []).map((r: any) => ({
    ...r,
    sender: Array.isArray(r.sender) ? r.sender[0] : r.sender,
    receiver: Array.isArray(r.receiver) ? r.receiver[0] : r.receiver,
  }))

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&family=DM+Mono&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family: 'Manrope', sans-serif; background-color: #0e1322; color: #dee1f7; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { backdrop-filter: blur(16px); background: rgba(26, 31, 47, 0.6); }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(77, 142, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="bg-[#0e1322] min-h-screen selection:bg-[#4d8eff]/30">
        <DashboardNavbar profile={profile} />
        <div className="flex pt-[60px] min-h-screen dot-grid">
          <DashboardSidebar profile={profile} session={session} />
          <main className="md:ml-64 w-full flex overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
            <ChatClient
              currentUser={profile}
              initialThreads={threads}
              initialFriendRequests={normalizedRequests}
              session={session}
            />
          </main>
        </div>
      </div>
    </>
  )
}