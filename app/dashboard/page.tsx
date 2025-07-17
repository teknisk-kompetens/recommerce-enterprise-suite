
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { UserHierarchyTree } from '@/components/dashboard/user-hierarchy-tree'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { ModuleUsageStats } from '@/components/dashboard/module-usage-stats'
import { QuickActions } from '@/components/dashboard/quick-actions'

export const dynamic = "force-dynamic"

async function getDashboardData(userId: string, userLevel: string) {
  // Get user hierarchy based on level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true,
              subscriptions: true,
              moduleAssignments: {
                include: { module: true }
              }
            }
          },
          subscriptions: true,
          moduleAssignments: {
            include: { module: true }
          }
        }
      },
      subscriptions: {
        include: {
          items: {
            include: { module: true }
          }
        }
      },
      moduleAssignments: {
        include: { module: true }
      }
    }
  })

  // Get metrics based on user level
  let metrics
  if (userLevel === 'MASTER') {
    metrics = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      totalRevenue: await prisma.subscription.aggregate({
        _sum: { totalAmount: true }
      }),
      activeSubscriptions: await prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      moduleAssignments: await prisma.moduleAssignment.count(),
      apiCalls24h: await prisma.apiRequest.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    }
  } else {
    // For non-master users, show metrics for their hierarchy
    const userIds = [userId]
    if (user?.children) {
      userIds.push(...user.children.map(c => c.id))
      user.children.forEach(child => {
        if (child.children) {
          userIds.push(...child.children.map(cc => cc.id))
        }
      })
    }

    metrics = {
      totalUsers: userIds.length,
      activeUsers: await prisma.user.count({
        where: { 
          id: { in: userIds },
          status: 'ACTIVE' 
        }
      }),
      totalRevenue: await prisma.subscription.aggregate({
        where: { userId: { in: userIds } },
        _sum: { totalAmount: true }
      }),
      activeSubscriptions: await prisma.subscription.count({
        where: { 
          userId: { in: userIds },
          status: 'ACTIVE' 
        }
      }),
      moduleAssignments: await prisma.moduleAssignment.count({
        where: { userId: { in: userIds } }
      }),
      apiCalls24h: 0 // Limited access for non-master
    }
  }

  return { user, metrics }
}

// Transform Prisma user data to match component interface
function transformUserData(prismaUser: any) {
  if (!prismaUser) return null
  
  return {
    ...prismaUser,
    name: prismaUser.name || undefined,
    companyName: prismaUser.companyName || undefined,
    children: prismaUser.children?.map((child: any) => transformUserData(child)) || []
  }
}

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    return null
  }

  const { user: prismaUser, metrics } = await getDashboardData(session.user.id, session.user.level)
  const user = transformUserData(prismaUser)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Managing your {session.user.level.toLowerCase()} level dashboard
          </p>
        </div>
        <QuickActions userLevel={session.user.level} />
      </div>

      {/* Overview Cards */}
      <DashboardOverview metrics={metrics} userLevel={session.user.level} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Hierarchy - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UserHierarchyTree user={user} userLevel={session.user.level} />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <RevenueChart userId={session.user.id} userLevel={session.user.level} />
          <ModuleUsageStats userId={session.user.id} userLevel={session.user.level} />
        </div>
      </div>
    </div>
  )
}
