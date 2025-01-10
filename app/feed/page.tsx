import { Metadata } from 'next'
import Layout from '../components/Layout'
import PostFeed from '../components/PostFeed'
import UserRecommendations from '../components/UserRecommendations'

export const metadata: Metadata = {
  title: 'Feed | Oommah',
  description: 'Your personalized feed on Oommah',
}

export default function FeedPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-6 text-primary">Your Feed</h1>
            <PostFeed />
          </div>
          <div className="md:w-1/3">
            <UserRecommendations />
          </div>
        </div>
      </div>
    </Layout>
  )
}

