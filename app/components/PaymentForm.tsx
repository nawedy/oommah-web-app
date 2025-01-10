'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface PaymentFormProps {
  amount: number
  currency: string
  productId: string
}

export default function PaymentForm({ amount, currency, productId }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
      })

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Payment successful',
          description: 'Your payment has been processed successfully.',
        })
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while processing your payment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full">
        {isProcessing ? 'Processing...' : `Pay ${amount / 100} ${currency.toUpperCase()}`}
      </Button>
    </form>
  )
}

