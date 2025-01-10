'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { encryptMessage, decryptMessage } from '../utils/encryption'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
}

interface Thread {
  id: string
  otherUser: {
    id: string
    name: string
    username: string
    image: string
    publicKey: string
  }
}

interface MessageThreadProps {
  thread: Thread
}

export default function MessageThread({ thread }: MessageThreadProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${thread.id}`)
        const data = await response.json()
        setMessages(data.messages)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()

    // WebSocket connection
    wsRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws`)
    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      wsRef.current.send(JSON.stringify({ type: 'auth', userId: user.id }))
    }
    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'new_message' && data.message.threadId === thread.id) {
        const decryptedContent = await decryptMessage(data.message.content, user.privateKey)
        setMessages((prevMessages) => [...prevMessages, { ...data.message, content: decryptedContent }])
      }
    }
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [thread.id, user.id, user.privateKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !wsRef.current) return

    try {
      const encryptedContent = await encryptMessage(newMessage, thread.otherUser.publicKey)

      wsRef.current.send(JSON.stringify({
        type: 'message',
        threadId: thread.id,
        content: encryptedContent,
        senderId: user.id,
      }))

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-4 p-4 border-b">
        <Avatar>
          <AvatarImage src={thread.otherUser.image} alt={thread.otherUser.name} />
          <AvatarFallback>{thread.otherUser.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{thread.otherUser.name}</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === user.id ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit" className="bg-primary text-white hover:bg-primary-dark">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

