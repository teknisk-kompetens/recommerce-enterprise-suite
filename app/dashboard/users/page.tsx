
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UserManagementDashboard } from '@/components/dashboard/user-management-dashboard'

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/')
  }

  // Check permissions - only Master, Super, and Reseller can access user management
  if (!['MASTER', 'SUPER', 'RESELLER'].includes(session.user.level)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your user hierarchy and permissions
          </p>
        </div>
      </div>

      <UserManagementDashboard userLevel={session.user.level} />
    </div>
  )
}
