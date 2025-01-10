'use client'

import { useState, useRef } from 'react'
import { usePosts } from '../contexts/PostsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trackEvent } from '../utils/analytics'
import { ImageIcon, VideoIcon, ImageIcon as PhotographIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function CreatePost() {
  const { addPost } = usePosts()
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value)
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'oommah_uploads') // Replace with your Cloudinary upload preset

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload media')
      }

      const data = await response.json()
      setMediaUrl(data.secure_url)
      setMediaType(file.type.startsWith('image') ? 'image' : 'video')
    } catch (error) {
      console.error('Error uploading media:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload media. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim() && !mediaUrl) return

    setIsSubmitting(true)

    try {
      const analysisResponse = await fetch('/api/content-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: caption, contentType: 'post', mediaUrl }),
      })

      const analysis = await analysisResponse.json()

      if (analysis.flagged) {
        toast({
          title: 'Content Flagged',
          description: 'Your post has been flagged for review.',
        })
        return
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, imageUrl: mediaUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const newPost = await response.json()
      addPost(newPost)
      setCaption('')
      setMediaUrl('')
      setMediaType(null)
      trackEvent('Post Created', { postId: newPost.id })
      toast({
        title: 'Success',
        description: 'Your post has been created successfully.',
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          placeholder="Write a caption..."
          value={caption}
          onChange={handleCaptionChange}
          className="w-full"
          aria-describedby="caption-description"
        />
        <p id="caption-description" className="text-sm text-gray-500 mt-1">
          Write a caption for your post. Use hashtags to make it discoverable.
        </p>
      </div>
      {mediaUrl && mediaType === 'image' && (
        <div className="relative w-full h-64">
          <Image src={mediaUrl} alt="Uploaded image" layout="fill" objectFit="cover" />
        </div>
      )}
      {mediaUrl && mediaType === 'video' && (
        <video src={mediaUrl} controls className="w-full" />
      )}
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        ref={fileInputRef}
        className="hidden"
        aria-label="Upload media"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
        aria-label="Upload media"
      >
        {mediaType === 'image' ? (
          <PhotographIcon className="mr-2 h-4 w-4" />
        ) : mediaType === 'video' ? (
          <VideoIcon className="mr-2 h-4 w-4" />
        ) : (
          <ImageIcon className="mr-2 h-4 w-4" />
        )}
        Upload Media
      </Button>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white hover:bg-primary-dark">
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </form>
  )
}

