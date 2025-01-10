import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { trackEvent } from '../utils/analytics'
import ReportContent from './ReportContent'
import AppealForm from './AppealForm'

interface CommentProps {
  comment: {
    id: string
    content: string
    user: {
      id: string
      name: string
      username: string
      avatar: string
    }
    likes: number
    createdAt: string
    flaggedForModeration: boolean
  }
}

export default function Comment({ comment }: CommentProps) {
  const [likes, setLikes] = useState(comment.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' })
      if (response.ok) {
        setLikes(isLiked ? likes - 1 : likes + 1)
        setIsLiked(!isLiked)
        trackEvent('Comment Interaction', { type: isLiked ? 'Unlike' : 'Like', commentId: comment.id })
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  if (comment.flaggedForModeration) {
    return (
      <div className="mb-4">
        <p className="text-gray-500">This comment has been removed for violating our community guidelines.</p>
        <AppealForm contentId={comment.id} contentType="comment" onAppealSubmitted={() => {}} />
      </div>
    )
  }

  return (
    <div className="flex space-x-4 mb-4">
      <Avatar>
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="bg-gray-100 rounded-lg p-3">
          <Link href={`/profile/${comment.user.username}`} className="font-semibold hover:underline">
            {comment.user.name}
          </Link>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Button variant="ghost" size="sm" onClick={handleLike} className="mr-2 p-0">
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {likes}
            </Button>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            <ReportContent contentType="comment" contentId={comment.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

