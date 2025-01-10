'use client'

import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import PostFeed from './components/PostFeed'
import ThreadFeed from './components/ThreadFeed'
import CreateThread from './components/CreateThread'
import Marketplace from './components/Marketplace'
import Recommendations from './components/Recommendations'
import { trackPageView } from './utils/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const { user } = useAuth()

  useEffect(() => {
    trackPageView('Home')
  }, [])

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Welcome to Oommah</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {user ? (
            <Tabs defaultValue="gram" className="mb-8">
              <TabsList>
                <TabsTrigger value="gram">Oommah Gram</TabsTrigger>
                <TabsTrigger value="threads">Oommah Threads</TabsTrigger>
              </TabsList>
              <TabsContent value="gram">
                <PostFeed />
              </TabsContent>
              <TabsContent value="threads">
                <CreateThread />
                <ThreadFeed />
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-lg mb-4">Please log in to see posts and threads.</p>
          )}
        </div>
        <div className="space-y-8">
          {user && <Recommendations />}
          <Marketplace />
        </div>
      </div>
    </Layout>
  )
}

