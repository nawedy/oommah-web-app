import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackEvent } from '../utils/analytics'

interface ThreadProps {
  thread: {
    id: string
    content: string
    user: {
      id: string
      name: string
      username: string
      avatar: string
    }
    likes: number
    comments: number
    createdAt: string
  }
}

export default function Thread({ thread }: ThreadProps) {
  const [likes, setLikes] = useState(thread.likes)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/threads/${thread.id}/like`, { method: 'POST' })
      if (response.ok) {
        setLikes(isLiked ? likes - 1 : likes + 1)
        setIsLiked(!isLiked)
        trackEvent('Thread Interaction', { type: isLiked ? 'Unlike' : 'Like', threadId: thread.id })
      }
    } catch (error) {
      console.error('Error liking thread:', error)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    trackEvent('Thread Interaction', { type: isSaved ? 'Unsave' : 'Save', threadId: thread.id })
  }

  const handleShare = () => {
    // Implement share functionality
    trackEvent('Thread Interaction', { type: 'Share', threadId: thread.id })
  }

  const renderContent = (content: string) => {
    const words = content.split(' ')
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return <Link key={index} href={`/hashtag/${word.slice(1)}`} className="text-primary hover:underline">{word} </Link>
      } else if (word.startsWith('@')) {
        return <Link key={index} href={`/profile/${word.slice(1)}`} className="text-primary hover:underline">{word} </Link>
      }
      return word + ' '
    })
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage src={thread.user.avatar} alt={thread.user.name} />
          <AvatarFallback>{thread.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Link href={`/profile/${thread.user.username}`} className="font-semibold hover:underline">
            {thread.user.name}
          </Link>
          <p className="text-sm text-gray-500">@{thread.user.username}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? 'Unsave' : 'Save'} thread</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-800">{renderContent(thread.content)}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4">
        <div className="flex space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleLike}>
                  <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {likes}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? 'Unlike' : 'Like'} thread</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5 mr-1" />
                  {thread.comments}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment on thread</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-5 w-5 mr-1" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share thread</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(thread.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </CardFooter>
    </Card>
  )
}

