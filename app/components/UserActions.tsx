'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '../contexts/AuthContext'

interface UserActionsProps {
  userId: string
  username: string
}

export default function UserActions({ userId, username }: UserActionsProps) {
  const { user } = useAuth()
  const [isMuted, setIsMuted] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  const handleMute = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/mute`, {
        method: isMuted ? 'DELETE' : 'POST',
      })
      if (response.ok) {
        setIsMuted(!isMuted)
        toast({
          title: isMuted ? 'User Unmuted' : 'User Muted',
          description: isMuted ? `You have unmuted @${username}` : `You have muted @${username}`,
        })
      } else {
        throw new Error('Failed to mute/unmute user')
      }
    } catch (error) {
      console.error('Error muting/unmuting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to mute/unmute user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleBlock = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: isBlocked ? 'DELETE' : 'POST',
      })
      if (response.ok) {
        setIsBlocked(!isBlocked)
        toast({
          title: isBlocked ? 'User Unblocked' : 'User Blocked',
          description: isBlocked ? `You have unblocked @${username}` : `You have blocked @${username}`,
        })
      } else {
        throw new Error('Failed to block/unblock user')
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error)
      toast({
        title: 'Error',
        description: 'Failed to block/unblock user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (user?.id === userId) {
    return null
  }

  return (
    <div className="flex space-x-2">
      <Button onClick={handleMute} variant="outline">
        {isMuted ? 'Unmute' : 'Mute'}
      </Button>
      <Button onClick={handleBlock} variant="outline">
        {isBlocked ? 'Unblock' : 'Block'}
      </Button>
    </div>
  )
}

