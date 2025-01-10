'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface RecommendedItem {
  id: string
  title: string
  user?: {
    id: string
    name: string
    username: string
    image: string
  }
}

export default function Recommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<{
    posts: RecommendedItem[]
    threads: RecommendedItem[]
    products: RecommendedItem[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations')
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }
        const data = await response.json()
        setRecommendations(data)
      } catch (err) {
        setError('Error fetching recommendations')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRecommendations()
    }
  }, [user])

  if (!user) {
    return null
  }

  if (isLoading) {
    return <RecommendationsSkeleton />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!recommendations) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <RecommendationList items={recommendations.posts} type="post" />
          </TabsContent>
          <TabsContent value="threads">
            <RecommendationList items={recommendations.threads} type="thread" />
          </TabsContent>
          <TabsContent value="products">
            <RecommendationList items={recommendations.products} type="product" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function RecommendationList({ items, type }: { items: RecommendedItem[], type: 'post' | 'thread' | 'product' }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex items-center space-x-4">
          {item.user && (
            <Avatar>
              <AvatarImage src={item.user.image} alt={item.user.name} />
              <AvatarFallback>{item.user.name[0]}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow">
            <Link href={`/${type}/${item.id}`} className="font-semibold hover:underline">
              {item.title}
            </Link>
            {item.user && (
              <p className="text-sm text-gray-500">by {item.user.name}</p>
            )}
          </div>
          <Button variant="outline" size="sm">View</Button>
        </li>
      ))}
    </ul>
  )
}

function RecommendationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <SkeletonList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <li key={index} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-grow">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </li>
      ))}
    </ul>
  )
}

