import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'
import ProfileHeader from '../../components/ProfileHeader'
import PostFeed from '../../components/PostFeed'
import ThreadFeed from '../../components/ThreadFeed'
import UserWarnings from '../../components/UserWarnings'
import UserReputation from '../../components/UserReputation'
import PortfolioSection from '../../components/PortfolioSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const prisma = new PrismaClient()

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      _count: {
        select: { followers: true, following: true }
      },
      profileTheme: true
    }
  })

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id
  const isAdmin = session?.user?.isAdmin

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{
      backgroundColor: user.profileTheme?.primaryColor || 'inherit',
      color: user.profileTheme?.secondaryColor || 'inherit',
      fontFamily: user.profileTheme?.fontFamily || 'inherit'
    }}>
      <ProfileHeader
        user={user}
        followersCount={user._count.followers}
        followingCount={user._count.following}
        isOwnProfile={isOwnProfile}
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="threads">Threads</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              {(isOwnProfile || isAdmin) && <TabsTrigger value="warnings">Warnings</TabsTrigger>}
            </TabsList>
            <TabsContent value="posts">
              <PostFeed userId={user.id} />
            </TabsContent>
            <TabsContent value="threads">
              <ThreadFeed userId={user.id} />
            </TabsContent>
            <TabsContent value="portfolio">
              <PortfolioSection userId={user.id} isOwnProfile={isOwnProfile} />
            </TabsContent>
            {(isOwnProfile || isAdmin) && (
              <TabsContent value="warnings">
                <UserWarnings userId={user.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
        <div>
          <UserReputation userId={user.id} />
        </div>
      </div>
    </div>
  )
}

