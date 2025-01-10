'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useThreads } from '../contexts/ThreadsContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trackEvent } from '../utils/analytics'

export default function CreateThread() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { addThread } = useThreads()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const newThread = await response.json()
        addThread(newThread)
        setContent('')
        trackEvent('Thread Created', { threadId: newThread.id })
      } else {
        throw new Error('Failed to create thread')
      }
    } catch (error) {
      console.error('Error creating thread:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow">
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-[100px] mb-2"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-primary text-white hover:bg-primary-dark"
            >
              {isSubmitting ? 'Posting...' : 'Post Thread'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

