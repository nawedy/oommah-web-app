'use client'

import { useState, useEffect } from 'react'
import { useThreads } from '../contexts/ThreadsContext'
import Thread from './Thread'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ThreadFeedProps {
  userId?: string
}

export default function ThreadFeed({ userId }: ThreadFeedProps) {
  const { threads, loadMoreThreads } = useThreads()
  
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [mutedUsers, setMutedUsers] = useState<string[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])

  useEffect(() => {
    const fetchMutedAndBlockedUsers = async () => {
      try {
        const [mutedResponse, blockedResponse] = await Promise.all([
          fetch('/api/users/muted'),
          fetch('/api/users/blocked')
        ])
        const mutedData = await mutedResponse.json()
        const blockedData = await blockedResponse.json()
        setMutedUsers(mutedData.map((u: any) => u.mutedId))
        setBlockedUsers(blockedData.map((u: any) => u.blockedId))
      } catch (error) {
        console.error('Error fetching muted and blocked users:', error)
      }
    }

    if (user) {
      fetchMutedAndBlockedUsers()
    }
  }, [user])

  const filteredThreads = threads.filter(thread => 
    (userId ? thread.user.id === userId : true) &&
    !mutedUsers.includes(thread.user.id) &&
    !blockedUsers.includes(thread.user.id)
  )

  const handleLoadMore = async () => {
    setIsLoading(true)
    await loadMoreThreads(userId)
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {filteredThreads.map((thread) => (
        <Thread key={thread.id} thread={thread} />
      ))}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </Button>
      </div>
    </div>
  )
}

