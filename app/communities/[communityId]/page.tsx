import { Metadata } from 'next'
import Layout from '../../components/Layout'
import CommunityDetails from '../../components/CommunityDetails'

export const metadata: Metadata = {
  title: 'Community Details | Oommah',
  description: 'View community details and forums on Oommah',
}

export default function CommunityDetailsPage({ params }: { params: { communityId: string } }) {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CommunityDetails communityId={params.communityId} />
      </div>
    </Layout>
  )
}

