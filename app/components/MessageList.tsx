'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

interface Thread {
  id: string
  otherUser: {
    id: string
    name: string
    username: string
    image: string
  }
  lastMessage: {
    content: string
    createdAt: string
  }
}

interface GroupChat {
  id: string
  name: string
  members: {
    id: string
    name: string
    image: string
  }[]
  messages: {
    content: string
    createdAt: string
  }[]
}

interface MessageListProps {
  onSelectThread: (thread: Thread) => void
  onSelectGroupChat: (groupChat: GroupChat) => void
}

export default function MessageList({ onSelectThread, onSelectGroupChat }: MessageListProps) {
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch('/api/messages/threads')
        const data = await response.json()
        setThreads(data)
      } catch (error) {
        console.error('Error fetching message threads:', error)
      }
    }

    const fetchGroupChats = async () => {
      try {
        const response = await fetch('/api/group-chats')
        const data = await response.json()
        setGroupChats(data)
      } catch (error) {
        console.error('Error fetching group chats:', error)
      }
    }

    if (user) {
      fetchThreads()
      fetchGroupChats()
    }
  }, [user])

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/group-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, memberIds: selectedMembers }),
      })

      if (response.ok) {
        const newGroupChat = await response.json()
        setGroupChats([...groupChats, newGroupChat])
        setIsCreateGroupDialogOpen(false)
        setNewGroupName('')
        setSelectedMembers([])
        toast({
          title: 'Group created',
          description: 'Your new group chat has been created successfully.',
        })
      } else {
        throw new Error('Failed to create group chat')
      }
    } catch (error) {
      console.error('Error creating group chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to create group chat. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsCreateGroupDialogOpen(true)}>Create Group Chat</Button>
      <h2 className="text-lg font-semibold">Direct Messages</h2>
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          onClick={() => onSelectThread(thread)}
        >
          <Avatar>
            <AvatarImage src={thread.otherUser.image} alt={thread.otherUser.name} />
            <AvatarFallback>{thread.otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold">{thread.otherUser.name}</h3>
            <p className="text-sm text-gray-500 truncate">{thread.lastMessage.content}</p>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
      <h2 className="text-lg font-semibold mt-6">Group Chats</h2>
      {groupChats.map((groupChat) => (
        <div
          key={groupChat.id}
          className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          onClick={() => onSelectGroupChat(groupChat)}
        >
          <Avatar>
            <AvatarFallback>{groupChat.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold">{groupChat.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {groupChat.messages[0]?.content || 'No messages yet'}
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {groupChat.messages[0]?.createdAt &&
              new Date(groupChat.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          {/* Add a component for selecting group members here */}
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

