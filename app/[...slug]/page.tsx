import { MetadataRoute } from 'next/server'
import {notFound} from 'next/navigation'
import {getServerSession} from 'next-auth/next'
import {authOptions} from '../../api/auth/[...nextauth]'
import {PrismaClient} from '@prisma/client'
import ProfileHeader from '../../components/ProfileHeader'
import PostFeed from '../../components/PostFeed'
import ThreadFeed from '../../components/ThreadFeed'
import UserWarnings from '../../components/UserWarnings'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {useParams, useSearchParams} from 'next/navigation'
import {loadStripe} from '@stripe/stripe-js'
import {Elements} from '@stripe/react-stripe-js'
import PaymentForm from '../../components/PaymentForm'

const prisma = new PrismaClient()

export default async function ProfilePage({params}: {params: {username: string}}) {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: {username: params.username},
    include: {
      _count: {
        select: {followers: true, following: true},
      },
    },
  })

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id
  const isAdmin = session?.user?.isAdmin

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader
        user={user}
        followersCount={user._count.followers}
        followingCount={user._count.following}
        isOwnProfile={isOwnProfile}
      />
      <Tabs defaultValue="posts" className="mt-8">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          {(isOwnProfile || isAdmin) && <TabsTrigger value="warnings">Warnings</TabsTrigger>}
        </TabsList>
        <TabsContent value="posts">
          <PostFeed userId={user.id} />
        </TabsContent>
        <TabsContent value="threads">
          <ThreadFeed userId={user.id} />
        </TabsContent>
        {(isOwnProfile || isAdmin) && (
          <TabsContent value="warnings">
            <UserWarnings userId={user.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export async function generateMetadata({params, searchParams}: {params: {slug: string[]}, searchParams: any}): Promise<MetadataRoute> {
  const clientSecret = searchParams.clientSecret
  const productId = params.slug[0]

  if (!clientSecret || !productId) {
    return {
      title: 'Checkout',
    }
  }

  const product = await prisma.product.findUnique({
    where: {id: productId},
    select: {name: true, price: true},
  })

  if (!product) {
    return {
      title: 'Checkout',
    }
  }

  return {
    title: `Checkout - ${product.name}`,
  }
}

export default async function CheckoutPage({params, searchParams}: {params: {slug: string[]}, searchParams: any}) {
  const clientSecret = searchParams.clientSecret
  const productId = params.slug[0]

  if (!clientSecret || !productId) {
    return <div>Missing client secret or product ID</div>
  }

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  const appearance = {
    theme: 'stripe',
  }
  const options = {
    clientSecret,
    appearance,
  }

  const product = await prisma.product.findUnique({
    where: {id: productId},
    select: {name: true, price: true},
  })

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <p className="mb-4">You are about to purchase: {product.name}</p>
      <p className="mb-8">Price: ${product.price.toFixed(2)}</p>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm amount={product.price * 100} currency="usd" productId={productId} />
      </Elements>
    </div>
  )
}

