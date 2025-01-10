import { MetadataRoute } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../../components/PaymentForm'

const prisma = new PrismaClient()

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { productId: string }
  searchParams: { clientSecret?: string }
}): Promise<MetadataRoute> {
  const { clientSecret } = searchParams
  const { productId } = params

  if (!clientSecret || !productId) {
    return {
      title: 'Checkout',
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, price: true },
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

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { productId: string }
  searchParams: { clientSecret?: string }
}) {
  const { clientSecret } = searchParams
  const { productId } = params

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
    where: { id: productId },
    select: { name: true, price: true },
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
