import { Metadata } from 'next'
import UserSettingsForm from '../components/UserSettingsForm'
import Layout from '../components/Layout'

export const metadata: Metadata = {
  title: 'User Settings | Oommah',
  description: 'Manage your Oommah account settings and preferences',
}

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Account Settings</h1>
        <UserSettingsForm />
      </div>
    </Layout>
  )
}

