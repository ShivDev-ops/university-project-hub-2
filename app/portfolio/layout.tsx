import DashboardNavbar from '@/components/DashboardNavbar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, avatar_url, score')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <DashboardNavbar profile={profile} />
      <div className="pt-[60px]">
        {children}
      </div>
    </>
  )
}
