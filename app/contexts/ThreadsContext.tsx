'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Thread {
  id: string
  content: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  likes: number
  comments: number
  createdAt: string
}

interface ThreadsContextType {
  threads: Thread[]
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>
  addThread: (thread: Thread) => void
  removeThread: (threadId: string) => void
  updateThread: (threadId: string, updatedThread: Partial<Thread>) => void
  loadMoreThreads: () => Promise<void>
}

const ThreadsContext = createContext<ThreadsContextType | undefined>(undefined)

export function ThreadsProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([])
  const { user } = useAuth()
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchThreads = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/threads?page=${page}`)
          const data = await response.json()
          setThreads((prevThreads) => [...prevThreads, ...data])
        } catch (error) {
          console.error('Error fetching threads:', error)
        }
      }
    }

    fetchThreads()
  }, [user, page])

  const addThread = (thread: Thread) => {
    setThreads((prevThreads) => [thread, ...prevThreads])
  }

  const removeThread = (threadId: string) => {
    setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId))
  }

  const updateThread = (threadId: string, updatedThread: Partial<Thread>) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === threadId ? { ...thread, ...updatedThread } : thread
      )
    )
  }

  const loadMoreThreads = async () => {
    setPage((prevPage) => prevPage + 1)
  }

  return (
    <ThreadsContext.Provider value={{ threads, setThreads, addThread, removeThread, updateThread, loadMoreThreads }}>
      {children}
    </ThreadsContext.Provider>
  )
}

export function useThreads() {
  const context = useContext(ThreadsContext)
  if (context === undefined) {
    throw new Error('useThreads must be used within a ThreadsProvider')
  }
  return context
}

