'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Warning {
  id: string
  level: number
  reason: string
  createdAt: string
  expiresAt: string | null
}

interface UserWarningsProps {
  userId: string
}

export default function UserWarnings({ userId }: UserWarningsProps) {
  const [warnings, setWarnings] = useState<Warning[]>([])

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/warnings`)
        if (response.ok) {
          const data = await response.json()
          setWarnings(data)
        } else {
          throw new Error('Failed to fetch warnings')
        }
      } catch (error) {
        console.error('Error fetching warnings:', error)
      }
    }

    fetchWarnings()
  }, [userId])

  const getWarningColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-yellow-500'
      case 2:
        return 'bg-orange-500'
      case 3:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Warnings</CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <p>No warnings found for this user.</p>
        ) : (
          <ul className="space-y-4">
            {warnings.map((warning) => (
              <li key={warning.id} className="flex items-center justify-between">
                <div>
                  <Badge className={getWarningColor(warning.level)}>
                    Level {warning.level}
                  </Badge>
                  <p className="mt-1">{warning.reason}</p>
                  <p className="text-sm text-gray-500">
                    Issued on: {new Date(warning.createdAt).toLocaleDateString()}
                  </p>
                  {warning.expiresAt && (
                    <p className="text-sm text-gray-500">
                      Expires on: {new Date(warning.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

