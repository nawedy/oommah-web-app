'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FlaggedContent {
  id: string
  type: 'post' | 'comment'
  content: string
  userId: string
  createdAt: string
  aiAnalysis?: string
}

interface AutoFlaggedContent extends FlaggedContent {
  classification: string
  explanation: string
}

interface UserReport {
  id: string
  contentType: 'post' | 'comment' | 'user'
  contentId: string
  reason: string
  details: string
  reporterId: string
  createdAt: string
}

interface Appeal {
  id: string
  contentId: string
  contentType: 'post' | 'comment'
  reason: string
  userId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function ModerationDashboard() {
  const { user } = useAuth()
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [autoFlaggedContent, setAutoFlaggedContent] = useState<AutoFlaggedContent[]>([])
  const [userReports, setUserReports] = useState<UserReport[]>([])
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | AutoFlaggedContent | UserReport | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [reputationChange, setReputationChange] = useState<number>(0)
  const [users, setUsers] = useState<{ id: string; name: string; username: string }[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [warningLevel, setWarningLevel] = useState<string>('1')
  const [warningReason, setWarningReason] = useState<string>('')
  const [warningExpiration, setWarningExpiration] = useState<string>('')
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [reputationReason, setReputationReason] = useState<string>('')

  useEffect(() => {
    fetchFlaggedContent()
    fetchAutoFlaggedContent()
    fetchUserReports()
    fetchUsers()
    fetchAppeals()
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

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/moderation/user-reports')
      if (response.ok) {
        const data = await response.json()
        setUserReports(data)
      } else {
        throw new Error('Failed to fetch user reports')
      }
    } catch (error) {
      console.error('Error fetching user reports:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch user reports. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        throw new Error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/moderation/appeals')
      if (response.ok) {
        const data = await response.json()
        setAppeals(data)
      } else {
        throw new Error('Failed to fetch appeals')
      }
    } catch (error) {
      console.error('Error fetching appeals:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch appeals. Please try again.',
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
        setUserReports(userReports.filter(report => report.contentId !== selectedContent.id))
        
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

  const handleIssueWarning = async () => {
    if (!selectedUser || !warningReason) return

    try {
      const response = await fetch(`/api/users/${selectedUser}/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: warningReason }),
      })

      if (response.ok) {
        const warning = await response.json()
        toast({
          title: 'Warning Issued',
          description: `A level ${warning.level} warning has been issued to the user.`,
        })
        setSelectedUser(null)
        setWarningReason('')
      } else {
        throw new Error('Failed to issue warning')
      }
    } catch (error) {
      console.error('Error issuing warning:', error)
      toast({
        title: 'Error',
        description: 'Failed to issue warning. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReputationChange = async () => {
    if (!selectedUser || reputationChange === 0) return

    try {
      const response = await fetch(`/api/users/${selectedUser}/reputation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: reputationChange, reason: reputationReason }),
      })

      if (response.ok) {
        const { reputation } = await response.json()
        toast({
          title: 'Reputation Updated',
          description: `User's reputation has been updated to ${reputation}.`,
        })
        setSelectedUser(null)
        setReputationChange(0)
        setReputationReason('')
      } else {
        throw new Error('Failed to update reputation')
      }
    } catch (error) {
      console.error('Error updating reputation:', error)
      toast({
        title: 'Error',
        description: 'Failed to update reputation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAppealDecision = async (appealId: string, decision: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/moderation/appeals/${appealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })

      if (response.ok) {
        toast({
          title: 'Appeal Decision Made',
          description: `The appeal has been ${decision}ed.`,
        })
        setAppeals(appeals.filter(appeal => appeal.id !== appealId))
        setSelectedAppeal(null)
      } else {
        throw new Error('Failed to process appeal decision')
      }
    } catch (error) {
      console.error('Error processing appeal decision:', error)
      toast({
        title: 'Error',
        description: 'Failed to process appeal decision. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const renderContent = (content: FlaggedContent | AutoFlaggedContent) => {
    const aiAnalysis = JSON.parse(content.aiAnalysis || '{}')
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Content</h3>
        <p className="mb-2"><strong>Type:</strong> {content.type}</p>
        <p className="mb-2"><strong>Content:</strong> {content.content}</p>
        {aiAnalysis.textAnalysis && (
          <div className="mb-2">
            <p><strong>Text Analysis:</strong></p>
            <p>Classification: {aiAnalysis.textAnalysis.classification}</p>
            <p>Explanation: {aiAnalysis.textAnalysis.explanation}</p>
          </div>
        )}
        {aiAnalysis.imageAnalysis && (
          <div className="mb-2">
            <p><strong>Image Analysis:</strong></p>
            <p>Adult Content: {aiAnalysis.imageAnalysis.adultContent}</p>
            <p>Violence: {aiAnalysis.imageAnalysis.violence}</p>
            <p>Racy: {aiAnalysis.imageAnalysis.racy}</p>
          </div>
        )}
        {aiAnalysis.videoAnalysis && (
          <div className="mb-2">
            <p><strong>Video Analysis:</strong></p>
            <p>Flagged: {aiAnalysis.videoAnalysis.flagged ? 'Yes' : 'No'}</p>
          </div>
        )}
        <Textarea
          placeholder="Enter reason for moderation action"
          value={moderationReason}
          onChange={(e) => setModerationReason(e.target.value)}
          className="mb-2"
        />
        <div className="flex space-x-2">
          <Button onClick={() => handleModeration('approve')} variant="default">Approve</Button>
          <Button onClick={() => handleModeration('remove')} variant="destructive">Remove</Button>
        </div>
      </div>
    )
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
            <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
            <TabsTrigger value="auto-flagged">Auto-Flagged Content</TabsTrigger>
            <TabsTrigger value="user-reports">User Reports</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
            <TabsTrigger value="warnings">Issue Warnings</TabsTrigger>
            <TabsTrigger value="reputation">Manage Reputation</TabsTrigger>
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
                {selectedContent && 'classification' in selectedContent ? renderContent(selectedContent) : (selectedContent && (
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
                ))}
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
                {selectedContent && 'classification' in selectedContent && renderContent(selectedContent)}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="user-reports">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">User Reports</h3>
                {userReports.map(report => (
                  <div
                    key={report.id}
                    className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedContent(report)}
                  >
                    <p className="font-semibold">{report.contentType}</p>
                    <p className="text-sm truncate">Reason: {report.reason}</p>
                    <p className="text-xs text-gray-500">Reported on: {new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div>
                {selectedContent && 'reason' in selectedContent && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Review User Report</h3>
                    <p className="mb-2"><strong>Content Type:</strong> {selectedContent.contentType}</p>
                    <p className="mb-2"><strong>Reason:</strong> {selectedContent.reason}</p>
                    <p className="mb-2"><strong>Details:</strong> {selectedContent.details}</p>
                    <p className="mb-2"><strong>Reported By:</strong> {selectedContent.reporterId}</p>
                    <p className="mb-2"><strong>Reported On:</strong> {new Date(selectedContent.createdAt).toLocaleString()}</p>
                    <Textarea
                      placeholder="Enter reason for moderation action"
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={() => handleModeration('approve')} variant="default">Dismiss Report</Button>
                      <Button onClick={() => handleModeration('remove')} variant="destructive">Remove Content</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appeals">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Appeals</h3>
                {appeals.map(appeal => (
                  <div
                    key={appeal.id}
                    className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedAppeal(appeal)}
                  >
                    <p className="font-semibold">{appeal.contentType}</p>
                    <p className="text-sm truncate">Reason: {appeal.reason}</p>
                    <p className="text-xs text-gray-500">Submitted on: {new Date(appeal.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div>
                {selectedAppeal && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Review Appeal</h3>
                    <p className="mb-2"><strong>Content Type:</strong> {selectedAppeal.contentType}</p>
                    <p className="mb-2"><strong>Reason:</strong> {selectedAppeal.reason}</p>
                    <p className="mb-2"><strong>Submitted By:</strong> {selectedAppeal.userId}</p>
                    <p className="mb-2"><strong>Submitted On:</strong> {new Date(selectedAppeal.createdAt).toLocaleString()}</p>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleAppealDecision(selectedAppeal.id, 'approve')} variant="default">Approve Appeal</Button>
                      <Button onClick={() => handleAppealDecision(selectedAppeal.id, 'reject')} variant="destructive">Reject Appeal</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="warnings">
            <div className="space-y-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">Select User</label>
                <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="warningReason" className="block text-sm font-medium text-gray-700">Warning Reason</label>
                <Textarea
                  id="warningReason"
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="Enter the reason for the warning"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleIssueWarning} disabled={!selectedUser || !warningReason}>
                Issue Warning
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="reputation">
            <div className="space-y-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">Select User</label>
                <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="reputationChange" className="block text-sm font-medium text-gray-700">Reputation Change</label>
                <Input
                  id="reputationChange"
                  type="number"
                  value={reputationChange}
                  onChange={(e) => setReputationChange(parseInt(e.target.value))}
                  placeholder="Enter reputation change (positive or negative)"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="reputationReason" className="block text-sm font-medium text-gray-700">Reason for Reputation Change</label>
                <Textarea
                  id="reputationReason"
                  value={reputationReason}
                  onChange={(e) => setReputationReason(e.target.value)}
                  placeholder="Enter the reason for the reputation change"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleReputationChange} disabled={!selectedUser || reputationChange === 0}>
                Update Reputation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

