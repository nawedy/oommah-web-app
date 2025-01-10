'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Post {
  id: string
  caption: string
  imageUrl: string
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

interface PostsContextType {
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  addPost: (post: Post) => void
  removePost: (postId: string) => void
  updatePost: (postId: string, updatedPost: Partial<Post>) => void
  loadMorePosts: () => Promise<void>
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const { user } = useAuth()
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/posts?page=${page}`)
          const data = await response.json()
          setPosts((prevPosts) => [...prevPosts, ...data])
        } catch (error) {
          console.error('Error fetching posts:', error)
        }
      }
    }

    fetchPosts()
  }, [user, page])

  const addPost = (post: Post) => {
    setPosts((prevPosts) => [post, ...prevPosts])
  }

  const removePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  const updatePost = (postId: string, updatedPost: Partial<Post>) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      )
    )
  }

  const loadMorePosts = async () => {
    setPage((prevPage) => prevPage + 1)
  }

  return (
    <PostsContext.Provider value={{ posts, setPosts, addPost, removePost, updatePost, loadMorePosts }}>
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}

