
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      // Set up WebSocket connection for real-time notifications
      setupWebSocket()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        
        // Show unread notifications
        const unreadCount = data.notifications.filter((n: Notification) => !n.isRead).length
        if (unreadCount > 0) {
          setIsVisible(true)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const setupWebSocket = () => {
    // In a real implementation, this would connect to a WebSocket server
    // For now, we'll simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance every few seconds
        const simulatedNotification: Notification = {
          id: Math.random().toString(),
          title: 'System Update',
          message: 'A new user has joined your organization',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        }
        
        setNotifications(prev => [simulatedNotification, ...prev])
        setIsVisible(true)
        toast.info(simulatedNotification.title)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const unreadNotifications = notifications.filter(n => !n.isRead).slice(0, 3)

  if (!isVisible || unreadNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {unreadNotifications.map((notification) => (
        <Card key={notification.id} className="w-80 shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <Badge variant={notification.type === 'success' ? 'default' : 'secondary'}>
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                  {notification.actionUrl && (
                    <Button size="sm" asChild>
                      <a href={notification.actionUrl}>View</a>
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {notifications.filter(n => !n.isRead).length > 3 && (
        <Card className="w-80 shadow-lg border border-gray-200">
          <CardContent className="p-3 text-center">
            <p className="text-sm text-gray-600">
              +{notifications.filter(n => !n.isRead).length - 3} more notifications
            </p>
            <Button variant="link" size="sm" asChild>
              <a href="/dashboard/notifications">View All</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
