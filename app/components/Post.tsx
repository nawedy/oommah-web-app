import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackEvent } from '../utils/analytics'
import ReportContent from './ReportContent'
import AppealForm from './AppealForm'

interface PostProps {
  post: {
    id: string
    caption: string
    imageUrl: string
    user: {
      id: string
      name: string
      username: string
      avatar: string
    }
    likes: number
    comments: number
    createdAt: string
    flaggedForModeration: boolean
  }
}

export default function Post({ post }: PostProps) {
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      if (response.ok) {
        setLikes(isLiked ? likes - 1 : likes + 1)
        setIsLiked(!isLiked)
        trackEvent('Post Interaction', { type: isLiked ? 'Unlike' : 'Like', postId: post.id })
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    trackEvent('Post Interaction', { type: isSaved ? 'Unsave' : 'Save', postId: post.id })
  }

  const handleShare = () => {
    // Implement share functionality
    trackEvent('Post Interaction', { type: 'Share', postId: post.id })
  }

  const renderHashtags = (caption: string) => {
    const words = caption.split(' ')
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return <Link key={index} href={`/hashtag/${word.slice(1)}`} className="text-primary hover:underline">{word} </Link>
      }
      return word + ' '
    })
  }

  if (post.flaggedForModeration) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <p className="text-gray-500">This content has been removed for violating our community guidelines.</p>
          <AppealForm contentId={post.id} contentType="post" onAppealSubmitted={() => {}} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="flex items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatar} alt={`${post.user.name}'s avatar`} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline">
            {post.user.name}
          </Link>
          <p className="text-sm text-gray-500">@{post.user.username}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleSave} aria-label={isSaved ? "Unsave post" : "Save post"}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? 'Unsave' : 'Save'} post</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image 
            src={post.imageUrl} 
            alt={post.caption} 
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <div className="flex w-full justify-between mb-2">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLike} aria-label={isLiked ? "Unlike post" : "Like post"}>
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? 'Unlike' : 'Like'} post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Comment on post">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comment on post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share post">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ReportContent contentType="post" contentId={post.id} />
        </div>
        <div className="text-sm font-semibold mb-1" aria-live="polite">{likes} likes</div>
        <p className="text-sm text-gray-800">{renderHashtags(post.caption)}</p>
        <Link href={`/post/${post.id}`} className="text-xs text-gray-500 mt-2 hover:underline">
          View all {post.comments} comments
        </Link>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </CardFooter>
    </Card>
  )
}

