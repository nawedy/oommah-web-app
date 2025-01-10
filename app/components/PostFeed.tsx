'use client'

import { useState, useEffect } from 'react'
import { usePosts } from '../contexts/PostsContext'
import Post from './Post'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface PostFeedProps {
  userId?: string
}

export default function PostFeed({ userId }: PostFeedProps) {
  const { posts, loadMorePosts } = usePosts()
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

  const filteredPosts = posts.filter(post => 
    (userId ? post.user.id === userId : true) &&
    !mutedUsers.includes(post.user.id) &&
    !blockedUsers.includes(post.user.id)
  )

  const handleLoadMore = async () => {
    setIsLoading(true)
    await loadMorePosts(userId)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {filteredPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      <div className="flex justify-center">
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

