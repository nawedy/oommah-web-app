'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserReputationProps {
  userId: string
}

export default function UserReputation({ userId }: UserReputationProps) {
  const [reputation, setReputation] = useState<number | null>(null)

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reputation`)
        if (response.ok) {
          const data = await response.json()
          setReputation(data.reputation)
        } else {
          throw new Error('Failed to fetch user reputation')
        }
      } catch (error) {
        console.error('Error fetching user reputation:', error)
      }
    }

    fetchReputation()
  }, [userId])

  if (reputation === null) {
    return <div>Loading reputation...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Reputation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{reputation}</p>
        <p className="text-sm text-gray-500">
          {reputation >= 100 ? 'Excellent' :
           reputation >= 50 ? 'Good' :
           reputation >= 0 ? 'Neutral' :
           'Poor'}
        </p>
      </CardContent>
    </Card>
  )
}

