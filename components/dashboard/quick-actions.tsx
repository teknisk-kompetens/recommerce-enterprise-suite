
'use client'

import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Package, 
  MessageSquare, 
  Settings,
  BarChart3,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface QuickActionsProps {
  userLevel: string
}

export function QuickActions({ userLevel }: QuickActionsProps) {
  const masterActions = [
    { label: 'Add User', icon: UserPlus, href: '/dashboard/users/new' },
    { label: 'Assign Module', icon: Package, href: '/dashboard/modules' },
    { label: 'Send Notification', icon: MessageSquare, href: '/dashboard/notifications/new' },
    { label: 'System Settings', icon: Settings, href: '/dashboard/settings' },
    { label: 'View Analytics', icon: BarChart3, href: '/dashboard/monitoring' },
    { label: 'Bulk Operations', icon: Zap, href: '/dashboard/bulk-operations' }
  ]

  const superActions = [
    { label: 'Add Sub-User', icon: UserPlus, href: '/dashboard/users/new' },
    { label: 'Manage Modules', icon: Package, href: '/dashboard/modules' },
    { label: 'Send Message', icon: MessageSquare, href: '/dashboard/notifications/new' },
    { label: 'View Reports', icon: BarChart3, href: '/dashboard/monitoring' }
  ]

  const companyActions = [
    { label: 'Update Profile', icon: Settings, href: '/dashboard/settings' },
    { label: 'View Modules', icon: Package, href: '/dashboard/modules' },
    { label: 'Branding', icon: Zap, href: '/dashboard/branding' }
  ]

  const getActions = () => {
    switch (userLevel) {
      case 'MASTER':
        return masterActions
      case 'SUPER':
      case 'RESELLER':
        return superActions
      default:
        return companyActions
    }
  }

  const actions = getActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
          <Zap className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => (
          <DropdownMenuItem key={action.label} asChild>
            <a href={action.href} className="flex items-center">
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
