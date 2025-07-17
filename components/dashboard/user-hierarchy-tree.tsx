
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  DollarSign, 
  Package,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  level: string
  status: string
  companyName?: string
  children?: User[]
  subscriptions?: any[]
  moduleAssignments?: any[]
}

interface UserHierarchyTreeProps {
  user: User | null
  userLevel: string
}

export function UserHierarchyTree({ user, userLevel }: UserHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([user?.id || '']))

  if (!user) return null

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateUserMetrics = (user: User) => {
    const childrenCount = user.children?.length || 0
    const totalRevenue = user.subscriptions?.reduce((sum, sub) => sum + (sub.totalAmount || 0), 0) || 0
    const activeModules = user.moduleAssignments?.filter(ma => ma.isActive).length || 0
    
    return { childrenCount, totalRevenue, activeModules }
  }

  const UserNode = ({ userData, level = 0 }: { userData: User, level?: number }) => {
    const isExpanded = expandedNodes.has(userData.id)
    const hasChildren = userData.children && userData.children.length > 0
    const metrics = calculateUserMetrics(userData)
    const canManage = userLevel === 'MASTER' || (userLevel === 'SUPER' && userData.level !== 'MASTER')

    return (
      <div className="space-y-2">
        <Card className={`transition-all duration-200 hover:shadow-md ${level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Expand/Collapse Button */}
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(userData.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6" /> // Spacer
                )}

                {/* User Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userData.name || userData.email} />
                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {userData.name?.split(' ').map(n => n[0]).join('') || userData.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {userData.name || userData.email}
                    </h4>
                    <Badge className={getLevelColor(userData.level)} variant="secondary">
                      {userData.level}
                    </Badge>
                    <Badge className={getStatusColor(userData.status)} variant="secondary">
                      {userData.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.companyName || userData.email}
                  </p>
                </div>
              </div>

              {/* Metrics and Actions */}
              <div className="flex items-center space-x-4">
                {/* Quick Metrics */}
                <div className="hidden md:flex items-center space-x-4 text-xs text-gray-500">
                  {metrics.childrenCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{metrics.childrenCount}</span>
                    </div>
                  )}
                  {metrics.totalRevenue > 0 && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${metrics.totalRevenue.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Package className="h-3 w-3" />
                    <span>{metrics.activeModules}</span>
                  </div>
                </div>

                {/* Actions Menu */}
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Modules
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Sub-User
                      </DropdownMenuItem>
                      {userData.status === 'ACTIVE' ? (
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <Users className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {userData.children?.map((child) => (
              <UserNode key={child.id} userData={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Hierarchy</span>
          </CardTitle>
          {userLevel === 'MASTER' && (
            <Button size="sm" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        <UserNode userData={user} />
        
        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {(user.children?.length || 0) + 1}
              </div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                ${calculateUserMetrics(user).totalRevenue.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {calculateUserMetrics(user).activeModules}
              </div>
              <div className="text-xs text-gray-500">Modules</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
