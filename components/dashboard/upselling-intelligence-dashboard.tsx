
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Target,
  Brain,
  Users,
  Package,
  Send,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Recommendation {
  moduleName: string
  reasoning: string[]
  confidence: number
  potentialRevenue: number
  sellingPoints: string[]
  priority: 'high' | 'medium' | 'low'
  module: any
  userId: string
  score: number
}

interface UpsellingIntelligenceDashboardProps {
  userLevel: string
  userId: string
}

export function UpsellingIntelligenceDashboard({ userLevel, userId }: UpsellingIntelligenceDashboardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch users for analysis
      const usersResponse = await fetch('/api/users?limit=50')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
        
        // Auto-select first user for initial recommendations
        if (usersData.users.length > 0) {
          setSelectedUser(usersData.users[0].id)
          await generateRecommendations(usersData.users[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async (targetUserId: string) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/upselling/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId })
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        
        if (data.fallback) {
          toast.info('Using fallback recommendations (AI service unavailable)')
        } else {
          toast.success('AI recommendations generated successfully')
        }
      } else {
        toast.error('Failed to generate recommendations')
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Error generating recommendations')
    } finally {
      setGenerating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const sendRecommendation = async (recommendation: Recommendation) => {
    try {
      // Send notification to user about the recommendation
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Module Recommendation',
          message: `We recommend ${recommendation.moduleName} for your business. ${recommendation.reasoning[0]}`,
          type: 'info',
          targetUsers: [recommendation.userId],
          actionUrl: '/dashboard/modules'
        })
      })

      if (response.ok) {
        toast.success('Recommendation sent to user')
      } else {
        toast.error('Failed to send recommendation')
      }
    } catch (error) {
      toast.error('Error sending recommendation')
    }
  }

  const totalPotentialRevenue = recommendations.reduce((sum, rec) => sum + rec.potentialRevenue, 0)
  const averageConfidence = recommendations.length > 0 
    ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length 
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {recommendations.length}
                </div>
                <div className="text-sm text-gray-600">Active Recommendations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${totalPotentialRevenue.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Potential Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {averageConfidence.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">AI Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Selection and Generate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a user for analysis...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.companyName})
                  </option>
                ))}
              </select>
              
              {selectedUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {users.find(u => u.id === selectedUser)?.name || 
                     users.find(u => u.id === selectedUser)?.email}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => selectedUser && generateRecommendations(selectedUser)}
              disabled={!selectedUser || generating}
              className="flex items-center space-x-2"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{generating ? 'Generating...' : 'Generate AI Recommendations'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Recommendations</span>
          </h2>

          {recommendations.map((recommendation, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.moduleName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="outline">
                            ${recommendation.potentialRevenue.toFixed(0)} potential
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Why this recommendation?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recommendation.reasoning.map((reason, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Selling Points</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.sellingPoints.map((point, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-700">AI Confidence Score</span>
                          <span className="font-medium">{recommendation.confidence}%</span>
                        </div>
                        <Progress value={recommendation.confidence} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <Button
                      onClick={() => sendRecommendation(recommendation)}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send to User</span>
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendations.length === 0 && selectedUser && !generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Recommendations Available
            </h3>
            <p className="text-gray-600 mb-4">
              Click "Generate AI Recommendations" to analyze the selected user and get intelligent upselling suggestions.
            </p>
            <Button
              onClick={() => selectedUser && generateRecommendations(selectedUser)}
              disabled={!selectedUser}
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
