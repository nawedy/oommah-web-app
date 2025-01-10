'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { trackEvent } from '../utils/analytics'
import UserActions from './UserActions'

interface ProfileHeaderProps {
  user: {
    id: string
    name: string
    username: string
    image: string
    bio: string
  }
  followersCount: number
  followingCount: number
  isOwnProfile: boolean
}

export default function ProfileHeader({ user, followersCount, followingCount, isOwnProfile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(followersCount)

  const handleFollowToggle = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)
        trackEvent('User Interaction', {
          type: isFollowing ? 'Unfollow' : 'Follow',
          targetUserId: user.id,
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <Image
          src={user.image || '/placeholder-avatar.png'}
          alt={user.name}
          width={100}
          height={100}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>
      <p className="mt-4 text-gray-700">{user.bio}</p>
      <div className="mt-4 flex space-x-4">
        <span>{followerCount} followers</span>
        <span>{followingCount} following</span>
      </div>
      <div className="mt-4 flex space-x-4">
        {!isOwnProfile && (
          <>
            <Button
              onClick={handleFollowToggle}
              className="bg-primary text-white hover:bg-primary-dark"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            <UserActions userId={user.id} username={user.username} />
          </>
        )}
      </div>
    </div>
  )
}

