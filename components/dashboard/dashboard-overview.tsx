
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  DollarSign, 
  Package, 
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalRevenue: { _sum: { totalAmount: number | null } }
  activeSubscriptions: number
  moduleAssignments: number
  apiCalls24h: number
}

interface DashboardOverviewProps {
  metrics: DashboardMetrics
  userLevel: string
}

export function DashboardOverview({ metrics, userLevel }: DashboardOverviewProps) {
  const [animatedValues, setAnimatedValues] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    moduleAssignments: 0,
    apiCalls24h: 0
  })

  // Animate numbers on mount
  useEffect(() => {
    const targets = {
      totalUsers: metrics.totalUsers || 0,
      activeUsers: metrics.activeUsers || 0,
      totalRevenue: metrics.totalRevenue._sum.totalAmount || 0,
      activeSubscriptions: metrics.activeSubscriptions || 0,
      moduleAssignments: metrics.moduleAssignments || 0,
      apiCalls24h: metrics.apiCalls24h || 0
    }

    const duration = 1000
    const steps = 50
    const stepTime = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedValues({
        totalUsers: Math.floor(targets.totalUsers * progress),
        activeUsers: Math.floor(targets.activeUsers * progress),
        totalRevenue: Math.floor(targets.totalRevenue * progress),
        activeSubscriptions: Math.floor(targets.activeSubscriptions * progress),
        moduleAssignments: Math.floor(targets.moduleAssignments * progress),
        apiCalls24h: Math.floor(targets.apiCalls24h * progress)
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedValues(targets)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [metrics])

  const cards = [
    {
      title: 'Total Users',
      value: animatedValues.totalUsers.toLocaleString(),
      icon: Users,
      description: `${animatedValues.activeUsers} active`,
      trend: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      visible: true
    },
    {
      title: 'Revenue',
      value: `$${animatedValues.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total recurring',
      trend: '+8.2%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      visible: userLevel === 'MASTER' || userLevel === 'SUPER'
    },
    {
      title: 'Active Subscriptions',
      value: animatedValues.activeSubscriptions.toLocaleString(),
      icon: Package,
      description: 'Monthly billing',
      trend: '+5.4%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      visible: userLevel === 'MASTER' || userLevel === 'SUPER'
    },
    {
      title: 'Module Assignments',
      value: animatedValues.moduleAssignments.toLocaleString(),
      icon: Zap,
      description: 'Active modules',
      trend: '+15.3%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      visible: true
    },
    {
      title: 'API Calls (24h)',
      value: animatedValues.apiCalls24h.toLocaleString(),
      icon: Activity,
      description: 'System activity',
      trend: '+22.1%',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      visible: userLevel === 'MASTER'
    }
  ]

  const visibleCards = cards.filter(card => card.visible)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {visibleCards.map((card, index) => (
        <Card key={card.title} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {card.trend}
                </Badge>
              </div>
              
              {/* Progress indicator based on some arbitrary target */}
              {card.title === 'Total Users' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Target: 1000 users</span>
                    <span>{Math.round((animatedValues.totalUsers / 1000) * 100)}%</span>
                  </div>
                  <Progress value={(animatedValues.totalUsers / 1000) * 100} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
        </Card>
      ))}
    </div>
  )
}
