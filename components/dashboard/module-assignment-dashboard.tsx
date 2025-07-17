
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Package, 
  Search, 
  Filter, 
  DollarSign,
  Users,
  Zap,
  Plus,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface Module {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  price: number
  features?: string[]
  assignments?: any[]
  subscriptionItems?: any[]
}

interface ModuleAssignmentDashboardProps {
  userLevel: string
  userId: string
}

export function ModuleAssignmentDashboard({ userLevel, userId }: ModuleAssignmentDashboardProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [categoryFilter])

  const fetchData = async () => {
    try {
      // Fetch modules
      const modulesParams = new URLSearchParams({
        includeAssignments: 'true',
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      })
      
      const modulesResponse = await fetch(`/api/modules?${modulesParams}`)
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json()
        setModules(modulesData.modules)
      }

      // Fetch users for assignment
      const usersResponse = await fetch('/api/users?limit=100')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CRM': return 'bg-blue-100 text-blue-800'
      case 'ANALYTICS': return 'bg-green-100 text-green-800'
      case 'ECOMMERCE': return 'bg-purple-100 text-purple-800'
      case 'MARKETING': return 'bg-orange-100 text-orange-800'
      case 'FINANCE': return 'bg-red-100 text-red-800'
      case 'INTEGRATIONS': return 'bg-cyan-100 text-cyan-800'
      case 'AI_TOOLS': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleModuleAssign = async (moduleId: string, userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/modules/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          userId,
          isActive
        })
      })

      if (response.ok) {
        toast.success(`Module ${isActive ? 'assigned' : 'deactivated'} successfully`)
        fetchData()
        setAssignDialogOpen(false)
        setSelectedModule(null)
        setSelectedUser('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Assignment failed')
      }
    } catch (error) {
      console.error('Error assigning module:', error)
      toast.error('Assignment failed')
    }
  }

  const getModuleStats = (module: Module) => {
    const totalAssignments = module.assignments?.length || 0
    const activeAssignments = module.assignments?.filter(a => a.isActive).length || 0
    const totalRevenue = module.subscriptionItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0
    
    return { totalAssignments, activeAssignments, totalRevenue }
  }

  const filteredModules = modules.filter(module =>
    module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="ANALYTICS">Analytics</SelectItem>
                <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="INTEGRATIONS">Integrations</SelectItem>
                <SelectItem value="AI_TOOLS">AI Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const stats = getModuleStats(module)
          const canAssign = ['MASTER', 'SUPER', 'RESELLER'].includes(userLevel)

          return (
            <Card key={module.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.displayName}</CardTitle>
                      <Badge className={getCategoryColor(module.category)} variant="secondary">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${module.price.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{module.description}</p>
                
                {/* Features */}
                {module.features && module.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {module.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{module.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{stats.activeAssignments}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{stats.totalAssignments}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {canAssign && (
                    <Button
                      onClick={() => {
                        setSelectedModule(module)
                        setAssignDialogOpen(true)
                      }}
                      className="flex-1"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Module</DialogTitle>
            <DialogDescription>
              Assign {selectedModule?.displayName} to a user in your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.name || user.email}</span>
                        <Badge variant="outline">{user.level}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedModule && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedModule.displayName}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedModule.description}</p>
                <div className="text-lg font-bold text-green-600 mt-2">
                  ${selectedModule.price.toFixed(0)}/month
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedModule && selectedUser) {
                  handleModuleAssign(selectedModule.id, selectedUser, true)
                }
              }}
              disabled={!selectedModule || !selectedUser}
            >
              Assign Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
