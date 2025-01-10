'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'

interface Community {
  id: string
  name: string
  description: string
  _count: {
    members: number
  }
}

export default function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunityDescription, setNewCommunityDescription] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities')
      if (response.ok) {
        const data = await response.json()
        setCommunities(data)
      } else {
        throw new Error('Failed to fetch communities')
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch communities. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCommunityName,
          description: newCommunityDescription,
        }),
      })

      if (response.ok) {
        const newCommunity = await response.json()
        setCommunities([...communities, newCommunity])
        setNewCommunityName('')
        setNewCommunityDescription('')
        toast({
          title: 'Success',
          description: 'Community created successfully!',
        })
      } else {
        throw new Error('Failed to create community')
      }
    } catch (error) {
      console.error('Error creating community:', error)
      toast({
        title: 'Error',
        description: 'Failed to create community. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {communities.map((community) => (
              <li key={community.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/communities/${community.id}`} className="font-semibold hover:underline">
                    {community.name}
                  </Link>
                  <p className="text-sm text-gray-500">{community.description}</p>
                  <p className="text-xs text-gray-400">{community._count.members} members</p>
                </div>
                <Button variant="outline" size="sm">Join</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Create a New Community</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <Input
                placeholder="Community Name"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                required
              />
              <Input
                placeholder="Community Description"
                value={newCommunityDescription}
                onChange={(e) => setNewCommunityDescription(e.target.value)}
                required
              />
              <Button type="submit">Create Community</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

