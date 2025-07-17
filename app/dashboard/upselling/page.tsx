
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UpsellingIntelligenceDashboard } from '@/components/dashboard/upselling-intelligence-dashboard'

export const dynamic = "force-dynamic"

export default async function UpsellingPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upselling Intelligence</h1>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations to maximize revenue and customer value
          </p>
        </div>
      </div>

      <UpsellingIntelligenceDashboard userLevel={session.user.level} userId={session.user.id} />
    </div>
  )
}
