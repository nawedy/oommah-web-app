'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Post from '../components/Post'
import Thread from '../components/Thread'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setUsers(data.users)
        setPosts(data.posts)
        setThreads(data.threads)
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    }

    if (query) {
      fetchSearchResults()
    }
  }, [query])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <Avatar>
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle>
                    <Link href={`/profile/${user.username}`} className="hover:underline">
                      {user.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="mt-2">{user.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="posts">
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="threads">
          <div className="space-y-4">
            {threads.map((thread) => (
              <Thread key={thread.id} thread={thread} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

