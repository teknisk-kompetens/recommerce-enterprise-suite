
'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardHeader() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'MASTER': return 'bg-purple-100 text-purple-800'
      case 'SUPER': return 'bg-blue-100 text-blue-800'
      case 'RESELLER': return 'bg-green-100 text-green-800'
      case 'AFFILIATE': return 'bg-yellow-100 text-yellow-800'
      case 'COMPANY': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session?.user) return null

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">re:Commerce</h1>
              <p className="text-xs text-gray-500">Enterprise Suite</p>
            </div>
          </div>
          
          {/* User Level Badge */}
          <Badge className={getLevelColor(session.user.level)}>
            {session.user.level} LEVEL
          </Badge>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {session.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                  {session.user.companyName && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.companyName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
