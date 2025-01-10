'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FlaggedContent {
  id: string
  type: 'post' | 'comment'
  content: string
  userId: string
  createdAt: string
}

interface AutoFlaggedContent extends FlaggedContent {
  classification: string
  explanation: string
}

export default function ModeratorDashboard() {
  const { user } = useAuth()
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [autoFlaggedContent, setAutoFlaggedContent] = useState<AutoFlaggedContent[]>([])
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | AutoFlaggedContent | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [reputationChange, setReputationChange] = useState(0)

  useEffect(() => {
    fetchFlaggedContent()
    fetchAutoFlaggedContent()
  }, [])

  const fetchFlaggedContent = async () => {
    try {
      const response = await fetch('/api/moderation/flagged-content')
      if (response.ok) {
        const data = await response.json()
        setFlaggedContent(data)
      } else {
        throw new Error('Failed to fetch flagged content')
      }
    } catch (error) {
      console.error('Error fetching flagged content:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch flagged content. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const fetchAutoFlaggedContent = async () => {
    try {
      const response = await fetch('/api/moderation/auto-flagged-content')
      if (response.ok) {
        const data = await response.json()
        setAutoFlaggedContent(data)
      } else {
        throw new Error('Failed to fetch auto-flagged content')
      }
    } catch (error) {
      console.error('Error fetching auto-flagged content:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch auto-flagged content. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleModeration = async (action: 'approve' | 'remove') => {
    if (!selectedContent || !moderationReason) return

    try {
      const response = await fetch(`/api/moderation/flagged-content/${selectedContent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: selectedContent.type,
          action,
          reason: moderationReason,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Moderation Action Taken',
          description: `The ${selectedContent.type} has been ${action}ed.`,
        })
        setFlaggedContent(flaggedContent.filter(content => content.id !== selectedContent.id))
        setAutoFlaggedContent(autoFlaggedContent.filter(content => content.id !== selectedContent.id))
        
        // Update user reputation
        await updateUserReputation(selectedContent.userId, action === 'approve' ? 5 : -10)

        setSelectedContent(null)
        setModerationReason('')
        setReputationChange(0)
      } else {
        throw new Error('Failed to moderate content')
      }
    } catch (error) {
      console.error('Error moderating content:', error)
      toast({
        title: 'Error',
        description: 'Failed to moderate content. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const updateUserReputation = async (userId: string, amount: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/reputation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        toast({
          title: 'Reputation Updated',
          description: `User reputation has been ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}.`,
        })
      } else {
        throw new Error('Failed to update user reputation')
      }
    } catch (error) {
      console.error('Error updating user reputation:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user reputation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flagged">
          <TabsList>
            <TabsTrigger value="flagged">User-Flagged Content</TabsTrigger>
            <TabsTrigger value="auto-flagged">Auto-Flagged Content</TabsTrigger>
          </TabsList>
          <TabsContent value="flagged">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Flagged Content</h3>
                {flaggedContent.map(content => (
                  <div
                    key={content.id}
                    className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedContent(content)}
                  >
                    <p className="font-semibold">{content.type}</p>
                    <p className="text-sm truncate">{content.content}</p>
                  </div>
                ))}
              </div>
              <div>
                {selectedContent && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Review Content</h3>
                    <p className="mb-2"><strong>Type:</strong> {selectedContent.type}</p>
                    <p className="mb-2"><strong>Content:</strong> {selectedContent.content}</p>
                    <Textarea
                      placeholder="Enter reason for moderation action"
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      type="number"
                      placeholder="Reputation change"
                      value={reputationChange}
                      onChange={(e) => setReputationChange(parseInt(e.target.value))}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={() => handleModeration('approve')} variant="default">Approve</Button>
                      <Button onClick={() => handleModeration('remove')} variant="destructive">Remove</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="auto-flagged">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Auto-Flagged Content</h3>
                {autoFlaggedContent.map(content => (
                  <div
                    key={content.id}
                    className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedContent(content)}
                  >
                    <p className="font-semibold">{content.type}</p>
                    <p className="text-sm truncate">{content.content}</p>
                    <p className="text-xs text-gray-500">Classification: {content.classification}</p>
                  </div>
                ))}
              </div>
              <div>
                {selectedContent && 'classification' in selectedContent && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Review Auto-Flagged Content</h3>
                    <p className="mb-2"><strong>Type:</strong> {selectedContent.type}</p>
                    <p className="mb-2"><strong>Content:</strong> {selectedContent.content}</p>
                    <p className="mb-2"><strong>Classification:</strong> {selectedContent.classification}</p>
                    <p className="mb-2"><strong>Explanation:</strong> {selectedContent.explanation}</p>
                    <Textarea
                      placeholder="Enter reason for moderation action"
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      type="number"
                      placeholder="Reputation change"
                      value={reputationChange}
                      onChange={(e) => setReputationChange(parseInt(e.target.value))}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={() => handleModeration('approve')} variant="default">Approve</Button>
                      <Button onClick={() => handleModeration('remove')} variant="destructive">Remove</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

