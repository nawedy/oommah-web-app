import { Metadata } from 'next'
import Layout from '../components/Layout'
import CommunityList from '../components/CommunityList'

export const metadata: Metadata = {
  title: 'Communities | Oommah',
  description: 'Join and create communities on Oommah',
}

export default function CommunitiesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Communities</h1>
        <CommunityList />
      </div>
    </Layout>
  )
}

