'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { trackEvent } from '../utils/analytics'

interface AdProps {
  ad: {
    id: string
    title: string
    description: string
    imageUrl: string
    videoUrl?: string
    link: string
    cta: string
    advertiser: string
    targetInterests?: string[]
    targetHobbies?: string[]
  }
}

export default function Ad({ ad }: AdProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    trackEvent('Ad Click', {
      adId: ad.id,
      adTitle: ad.title,
      advertiser: ad.advertiser
    })
    window.open(ad.link, '_blank', 'noopener,noreferrer')
  }

  const handleImpression = () => {
    trackEvent('Ad Impression', {
      adId: ad.id,
      adTitle: ad.title,
      advertiser: ad.advertiser
    })
  }

  // Track impression when ad is mounted
  useState(() => {
    handleImpression()
  }, [])

  return (
    <Card 
      className="mb-4 overflow-hidden transition-shadow duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Sponsored by {ad.advertiser}</span>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {ad.videoUrl ? (
          <video
            src={ad.videoUrl}
            className="w-full rounded-lg"
            controls
            poster={ad.imageUrl}
            aria-label={`Advertisement video for ${ad.title}`}
          />
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={ad.imageUrl}
              alt={`Advertisement for ${ad.title}`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-200"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold text-primary">{ad.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{ad.description}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button 
          onClick={handleClick}
          className="w-full bg-secondary-orange text-white hover:bg-secondary-blue"
        >
          {ad.cta || 'Learn More'}
        </Button>
      </CardFooter>
    </Card>
  )
}

