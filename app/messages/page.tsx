'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import MessageList from '../components/MessageList'
import MessageThread from '../components/MessageThread'
import { Card } from '@/components/ui/card'

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedThread, setSelectedThread] = useState(null)

  if (!user) {
    return (
      <Layout>
        <div>Please log in to view your messages.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Messages</h1>
      <div className="flex space-x-4">
        <Card className="w-1/3 p-4">
          <MessageList onSelectThread={setSelectedThread} />
        </Card>
        <Card className="w-2/3 p-4">
          {selectedThread ? (
            <MessageThread thread={selectedThread} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

