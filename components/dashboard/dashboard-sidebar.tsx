
'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  CreditCard, 
  Key, 
  Palette, 
  Zap,
  MessageSquare,
  Activity,
  Globe,
  Shield,
  Database,
  Layers
} from 'lucide-react'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
    levels: ['MASTER', 'SUPER', 'RESELLER', 'AFFILIATE', 'COMPANY']
  },
  {
    name: 'User Management',
    href: '/dashboard/users',
    icon: Users,
    levels: ['MASTER', 'SUPER', 'RESELLER']
  },
  {
    name: 'Module Assignment',
    href: '/dashboard/modules',
    icon: Package,
    levels: ['MASTER', 'SUPER', 'RESELLER']
  },
  {
    name: 'Billing & Subscriptions',
    href: '/dashboard/billing',
    icon: CreditCard,
    levels: ['MASTER', 'SUPER', 'RESELLER']
  },
  {
    name: 'White Label Branding',
    href: '/dashboard/branding',
    icon: Palette,
    levels: ['MASTER', 'SUPER', 'RESELLER', 'COMPANY']
  },
  {
    name: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
    levels: ['MASTER', 'SUPER', 'RESELLER', 'COMPANY']
  },
  {
    name: 'Real-Time Monitoring',
    href: '/dashboard/monitoring',
    icon: Activity,
    levels: ['MASTER', 'SUPER']
  },
  {
    name: 'Upselling Intelligence',
    href: '/dashboard/upselling',
    icon: Zap,
    levels: ['MASTER', 'SUPER', 'RESELLER']
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: MessageSquare,
    levels: ['MASTER', 'SUPER', 'RESELLER', 'AFFILIATE', 'COMPANY']
  },
  {
    name: 'Bulk Operations',
    href: '/dashboard/bulk-operations',
    icon: Layers,
    levels: ['MASTER', 'SUPER']
  },
  {
    name: 'System Settings',
    href: '/dashboard/settings',
    icon: Settings,
    levels: ['MASTER']
  }
]

export function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) return null

  const userLevel = session.user.level
  const filteredNavigation = navigation.filter(item => 
    item.levels.includes(userLevel)
  )

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className={cn(
                  'mr-3 h-4 w-4',
                  isActive ? 'text-blue-700' : 'text-gray-400'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="font-medium">{userLevel}</span>
            </div>
            <div className="flex justify-between">
              <span>Company:</span>
              <span className="font-medium truncate max-w-20">
                {session.user.companyName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Upgrade CTA for non-master users */}
        {userLevel !== 'MASTER' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900 mb-1">
              Upgrade Available
            </h3>
            <p className="text-xs text-purple-700 mb-2">
              Unlock advanced features and increase your earning potential
            </p>
            <Link
              href="/dashboard/upselling"
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              View Recommendations →
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
