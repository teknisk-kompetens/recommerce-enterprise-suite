
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { NotificationCenter } from '@/components/dashboard/notification-center'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <NotificationCenter />
    </div>
  )
}
