import { Metadata } from 'next'
import Layout from '../../components/Layout'
import ModerationDashboard from '../../components/ModerationDashboard'

export const metadata: Metadata = {
  title: 'Content Moderation | Oommah Admin',
  description: 'Manage reported content on Oommah',
}

export default function ModerationPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Content Moderation</h1>
        <ModerationDashboard />
      </div>
    </Layout>
  )
}

