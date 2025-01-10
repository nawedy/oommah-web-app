import { Metadata } from 'next'
import Layout from '../../components/Layout'
import AnalyticsDashboard from '../../components/AnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Oommah Admin',
  description: 'View analytics and insights for the Oommah platform',
}

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Analytics Dashboard</h1>
        <AnalyticsDashboard />
      </div>
    </Layout>
  )
}

