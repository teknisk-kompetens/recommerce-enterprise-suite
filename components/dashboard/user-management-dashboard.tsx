
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  DollarSign,
  Package,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  name?: string
  level: string
  status: string
  companyName?: string
  createdAt: string
  subscriptions?: any[]
  moduleAssignments?: any[]
  children?: any[]
}

interface UserManagementDashboardProps {
  userLevel: string
}

export function UserManagementDashboard({ userLevel }: UserManagementDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, levelFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setLoading(false)
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
    const totalRevenue = user.subscriptions?.reduce((sum, sub) => sum + (sub.totalAmount || 0), 0) || 0
    const activeModules = user.moduleAssignments?.filter(ma => ma.isActive).length || 0
    const childrenCount = user.children?.length || 0
    
    return { totalRevenue, activeModules, childrenCount }
  }

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'edit':
          // Navigate to edit user page
          window.location.href = `/dashboard/users/${userId}/edit`
          break
        case 'suspend':
          // Implement suspend user logic
          toast.success('User suspended successfully')
          fetchUsers()
          break
        case 'activate':
          // Implement activate user logic
          toast.success('User activated successfully')
          fetchUsers()
          break
        case 'manage-modules':
          // Navigate to module management
          window.location.href = `/dashboard/modules?userId=${userId}`
          break
        default:
          break
      }
    } catch (error) {
      toast.error('Action failed')
    }
  }

  const canManageUser = (user: User) => {
    if (userLevel === 'MASTER') return true
    if (userLevel === 'SUPER' && user.level !== 'MASTER') return true
    if (userLevel === 'RESELLER' && ['COMPANY', 'AFFILIATE'].includes(user.level)) return true
    return false
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="MASTER">Master</SelectItem>
                  <SelectItem value="SUPER">Super</SelectItem>
                  <SelectItem value="RESELLER">Reseller</SelectItem>
                  <SelectItem value="AFFILIATE">Affiliate</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userLevel === 'MASTER' && (
              <Button className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => {
          const metrics = calculateUserMetrics(user)
          const canManage = canManageUser(user)

          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={user.name || user.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user.name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {user.name || user.email}
                        </h3>
                        <Badge className={getLevelColor(user.level)}>
                          {user.level}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{user.email}</span>
                        {user.companyName && (
                          <span className="truncate">{user.companyName}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Metrics */}
                    <div className="hidden md:flex items-center space-x-6 text-sm">
                      {metrics.totalRevenue > 0 && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span>${metrics.totalRevenue.toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Package className="h-4 w-4" />
                        <span>{metrics.activeModules}</span>
                      </div>
                      {metrics.childrenCount > 0 && (
                        <div className="flex items-center space-x-1 text-purple-600">
                          <UserPlus className="h-4 w-4" />
                          <span>{metrics.childrenCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('edit', user.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('manage-modules', user.id)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Modules
                          </DropdownMenuItem>
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleUserAction('suspend', user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleUserAction('activate', user.id)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
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
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
