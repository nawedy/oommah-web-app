'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'message' | 'product_review' | 'moderation' | 'warning'
  content: string
  createdAt: string
  read: boolean
  moderationAction?: string
}

export default function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      connectWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [user])

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)
    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      wsRef.current.send(JSON.stringify({ type: 'auth', userId: user.id }))
    }
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'moderation_notification') {
        handleNewNotification(data)
      }
    }
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setTimeout(connectWebSocket, 5000) // Attempt to reconnect after 5 seconds
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleNewNotification = (data: any) => {
    const newNotification: Notification = {
      id: Date.now().toString(), // Temporary ID
      type: 'moderation',
      content: `Your ${data.contentType} has been ${data.action === 'approve' ? 'approved' : 'removed'}.`,
      createdAt: new Date().toISOString(),
      read: false,
      moderationAction: data.action,
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
    toast({
      title: 'New Notification',
      description: newNotification.content,
    })
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const renderNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👤'
      case 'message':
        return '✉️'
      case 'product_review':
        return '⭐'
      case 'moderation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return '📢'
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card>
          <CardContent className="p-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 p-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      notification.read ? 'opacity-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <span className="mr-2 text-2xl">
                        {renderNotificationIcon(notification.type)}
                      </span>
                      <div>
                        <p className="text-sm">{notification.content}</p>
                        {notification.type === 'moderation' && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Action: {notification.moderationAction}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

