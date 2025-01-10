'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface AppealFormProps {
  contentId: string
  contentType: 'post' | 'comment'
  onAppealSubmitted: () => void
}

export default function AppealForm({ contentId, contentType, onAppealSubmitted }: AppealFormProps) {
  const [appealReason, setAppealReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appealReason.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/moderation/appeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId, contentType, appealReason }),
      })

      if (response.ok) {
        toast({
          title: 'Appeal Submitted',
          description: 'Your appeal has been submitted for review.',
        })
        onAppealSubmitted()
      } else {
        throw new Error('Failed to submit appeal')
      }
    } catch (error) {
      console.error('Error submitting appeal:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit appeal. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appeal Content Removal</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Please explain why you believe this content should not have been removed..."
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            rows={4}
            className="w-full"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !appealReason.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

