'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { trackEvent } from '../utils/analytics'
import { Star, StarHalf } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from './PaymentForm'

interface Review {
  id: string
  rating: number
  comment: string
  user: {
    name: string
    avatar: string
  }
  createdAt: string
}

interface ProductProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    averageRating: number
    seller: {
      id: string
      name: string
      rating: number
    }
    reviews: Review[]
  }
}

export default function Product({ product }: ProductProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    trackEvent('Product Buy Clicked', { productId: product.id, productName: product.name })

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price * 100, // Stripe expects amount in cents
          currency: 'usd',
          productId: product.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      const appearance: StripeElementsOptions['appearance'] = {
        theme: 'stripe',
      }

      const options: StripeElementsOptions = {
        appearance,
        clientSecret,
      }

      router.push(`/checkout/${product.id}?clientSecret=${clientSecret}`)
    } catch (error) {
      console.error('Error initiating payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, productId: product.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      })

      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        <div className="relative w-full pt-[100%]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          {renderStars(product.averageRating)}
          <span className="text-sm font-semibold ml-1">{product.averageRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">({product.reviews.length} reviews)</span>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-sm">Seller: {product.seller.name}</p>
            <p className="text-sm">Rating: {product.seller.rating.toFixed(1)}/5</p>
          </div>
          <Button onClick={handleBuy} className="bg-secondary-orange text-white hover:bg-secondary-blue">
            Buy Now
          </Button>
        </div>
      </CardFooter>
      <CardContent className="border-t">
        <h4 className="text-lg font-semibold mb-2">Reviews</h4>
        {product.reviews.map((review) => (
          <div key={review.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
        <form onSubmit={handleSubmitReview} className="mt-4">
          <h5 className="text-lg font-semibold mb-2">Write a Review</h5>
          <div className="flex items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="button"
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </Button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            className="mb-2"
            rows={4}
          />
          <Button type="submit" disabled={isSubmitting || rating === 0 || !comment.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

