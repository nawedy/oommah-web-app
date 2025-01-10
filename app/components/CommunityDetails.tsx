'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'

interface Forum {
  id: string
  name: string
  description: string
}

interface Community {
  id: string
  name: string
  description: string
  forums: Forum[]
  _count: {
    members: number
  }
}

export default function CommunityDetails({ communityId }: { communityId: string }) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [newForumName, setNewForumName] = useState('')
  const [newForumDescription, setNewForumDescription] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchCommunityDetails()
  }, [communityId])

  const fetchCommunityDetails = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}`)
      if (response.ok) {
        const data = await response.json()
        setCommunity(data)
      } else {
        throw new Error('Failed to fetch community details')
      }
    } catch (error) {
      console.error('Error fetching community details:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch community details. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/communities/${communityId}/forums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newForumName,
          description: newForumDescription,
        }),
      })

      if (response.ok) {
        const newForum = await response.json()
        setCommunity(prevCommunity => ({
          ...prevCommunity!,
          forums: [...prevCommunity!.forums, newForum],
        }))
        setNewForumName('')
        setNewForumDescription('')
        toast({
          title: 'Success',
          description: 'Forum created successfully!',
        })
      } else {
        throw new Error('Failed to create forum')
      }
    } catch (error) {
      console.error('Error creating forum:', error)
      toast({
        title: 'Error',
        description: 'Failed to create forum. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (!community) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{community.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">{community.description}</p>
          <p className="text-sm text-gray-400">{community._count.members} members</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forums</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {community.forums.map((forum) => (
              <li key={forum.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/communities/${communityId}/forums/${forum.id}`} className="font-semibold hover:underline">
                    {forum.name}
                  </Link>
                  <p className="text-sm text-gray-500">{forum.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/communities/${communityId}/forums/${forum.id}`)}>
                  View Topics
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Create a New Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateForum} className="space-y-4">
              <Input
                placeholder="Forum Name"
                value={newForumName}
                onChange={(e) => setNewForumName(e.target.value)}
                required
              />
              <Input
                placeholder="Forum Description"
                value={newForumDescription}
                onChange={(e) => setNewForumDescription(e.target.value)}
                required
              />
              <Button type="submit">Create Forum</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

