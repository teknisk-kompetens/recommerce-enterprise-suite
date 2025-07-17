
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenueChartProps {
  userId: string
  userLevel: string
}

export function RevenueChart({ userId, userLevel }: RevenueChartProps) {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState<{ percentage: number; direction: 'up' | 'down' }>({
    percentage: 0,
    direction: 'up'
  })

  useEffect(() => {
    fetchRevenueData()
  }, [userId])

  const fetchRevenueData = async () => {
    try {
      // Simulate API call - in real app this would fetch actual data
      const simulatedData = generateSimulatedRevenueData()
      setRevenueData(simulatedData)
      
      // Calculate trend
      if (simulatedData.length >= 2) {
        const current = simulatedData[simulatedData.length - 1].revenue
        const previous = simulatedData[simulatedData.length - 2].revenue
        const percentage = ((current - previous) / previous) * 100
        setTrend({
          percentage: Math.abs(percentage),
          direction: percentage >= 0 ? 'up' : 'down'
        })
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSimulatedRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseRevenue = userLevel === 'MASTER' ? 50000 : userLevel === 'SUPER' ? 15000 : 5000
    
    return months.map((month, index) => {
      const growth = 1 + (index * 0.1) + (Math.random() * 0.2 - 0.1)
      const revenue = Math.round(baseRevenue * growth)
      const recurring = Math.round(revenue * 0.8)
      const oneTime = revenue - recurring
      
      return {
        month,
        revenue,
        recurring,
        oneTime,
        growth: growth > 1 ? '+' + ((growth - 1) * 100).toFixed(1) + '%' : ''
      }
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestRevenue = revenueData[revenueData.length - 1]?.revenue || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
          <Badge variant={trend.direction === 'up' ? 'default' : 'destructive'}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.percentage.toFixed(1)}%
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            ${latestRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Current month revenue</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <XAxis 
                dataKey="month" 
                tickLine={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'revenue' ? 'Total Revenue' : 
                  name === 'recurring' ? 'Recurring Revenue' : 'One-time Revenue'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="recurring" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-600">Total Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-green-500 border-dashed border-t"></div>
            <span className="text-gray-600">Recurring Revenue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
