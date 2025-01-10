'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface RecommendedUser {
  id: string
  name: string
  username: string
  image: string
  followerCount: number
  postCount: number
}

export default function UserRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/users/recommendations?limit=5')
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Error fetching user recommendations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRecommendations()
    }
  }, [user])

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setRecommendations(recommendations.filter((rec) => rec.id !== userId))
      }
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Users</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recommendations.map((rec) => (
            <li key={rec.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={rec.image} alt={rec.name} />
                  <AvatarFallback>{rec.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{rec.name}</p>
                  <p className="text-sm text-gray-500">@{rec.username}</p>
                </div>
              </div>
              <Button onClick={() => handleFollow(rec.id)} variant="outline" size="sm">
                Follow
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

