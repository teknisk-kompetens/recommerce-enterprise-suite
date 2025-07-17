
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Package, Users, DollarSign } from 'lucide-react'

interface ModuleStats {
  id: string
  name: string
  displayName: string
  category: string
  totalUsers: number
  activeUsers: number
  revenue: number
  usagePercentage: number
  color: string
}

interface ModuleUsageStatsProps {
  userId: string
  userLevel: string
}

export function ModuleUsageStats({ userId, userLevel }: ModuleUsageStatsProps) {
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModuleStats()
  }, [userId])

  const fetchModuleStats = async () => {
    try {
      // Simulate API call - in real app this would fetch actual data
      const simulatedStats = generateSimulatedModuleStats()
      setModuleStats(simulatedStats)
    } catch (error) {
      console.error('Error fetching module stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSimulatedModuleStats = () => {
    const modules = [
      { name: 'crm_basic', displayName: 'CRM Basic', category: 'CRM', color: 'bg-blue-500' },
      { name: 'analytics_core', displayName: 'Analytics Core', category: 'Analytics', color: 'bg-green-500' },
      { name: 'ecommerce_basic', displayName: 'E-commerce', category: 'E-commerce', color: 'bg-purple-500' },
      { name: 'marketing_suite', displayName: 'Marketing Suite', category: 'Marketing', color: 'bg-orange-500' },
      { name: 'ai_assistant', displayName: 'AI Assistant', category: 'AI Tools', color: 'bg-pink-500' }
    ]

    return modules.map((module, index) => {
      const baseUsers = userLevel === 'MASTER' ? 150 : userLevel === 'SUPER' ? 50 : 15
      const totalUsers = Math.round(baseUsers * (0.6 + Math.random() * 0.4))
      const activeUsers = Math.round(totalUsers * (0.7 + Math.random() * 0.25))
      const revenue = totalUsers * (30 + Math.random() * 50)
      const usagePercentage = (activeUsers / totalUsers) * 100

      return {
        id: module.name + '_' + index,
        ...module,
        totalUsers,
        activeUsers,
        revenue,
        usagePercentage
      }
    }).sort((a, b) => b.usagePercentage - a.usagePercentage)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = moduleStats.reduce((sum, module) => sum + module.revenue, 0)
  const averageUsage = moduleStats.reduce((sum, module) => sum + module.usagePercentage, 0) / moduleStats.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Module Usage</span>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Average Usage:</span>
            <Badge variant="secondary">{averageUsage.toFixed(1)}%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Revenue:</span>
            <span className="font-medium">${totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {moduleStats.map((module) => (
            <div key={module.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${module.color}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {module.displayName}
                    </h4>
                    <p className="text-xs text-gray-500">{module.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {module.usagePercentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {module.activeUsers}/{module.totalUsers} users
                  </div>
                </div>
              </div>
              
              <Progress 
                value={module.usagePercentage} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{module.totalUsers} total</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${module.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick insights */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">
                {moduleStats.length}
              </div>
              <div className="text-xs text-gray-500">Active Modules</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">
                {moduleStats.reduce((sum, m) => sum + m.activeUsers, 0)}
              </div>
              <div className="text-xs text-gray-500">Active Users</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
