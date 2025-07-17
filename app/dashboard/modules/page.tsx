
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ModuleAssignmentDashboard } from '@/components/dashboard/module-assignment-dashboard'

export const dynamic = "force-dynamic"

export default async function ModulesPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module Management</h1>
          <p className="text-gray-600 mt-1">
            Assign and manage modules across your organization
          </p>
        </div>
      </div>

      <ModuleAssignmentDashboard userLevel={session.user.level} userId={session.user.id} />
    </div>
  )
}
