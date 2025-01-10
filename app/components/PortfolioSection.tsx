'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl?: string
  link?: string
}

export default function PortfolioSection({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({})
  const [isAddingItem, setIsAddingItem] = useState(false)

  useEffect(() => {
    fetchPortfolioItems()
  }, [userId])

  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/portfolio`)
      if (response.ok) {
        const data = await response.json()
        setPortfolioItems(data)
      } else {
        throw new Error('Failed to fetch portfolio items')
      }
    } catch (error) {
      console.error('Error fetching portfolio items:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio items. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/users/${userId}/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      })

      if (response.ok) {
        const addedItem = await response.json()
        setPortfolioItems([addedItem, ...portfolioItems])
        setNewItem({})
        setIsAddingItem(false)
        toast({
          title: 'Success',
          description: 'Portfolio item added successfully!',
        })
      } else {
        throw new Error('Failed to add portfolio item')
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error)
      toast({
        title: 'Error',
        description: 'Failed to add portfolio item. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <Button onClick={() => setIsAddingItem(!isAddingItem)}>
          {isAddingItem ? 'Cancel' : 'Add Portfolio Item'}
        </Button>
      )}

      {isAddingItem && (
        <Card>
          <CardHeader>
            <CardTitle>Add Portfolio Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <Input
                placeholder="Title"
                value={newItem.title || ''}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required
              />
              <Input
                placeholder="Image URL"
                value={newItem.imageUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              />
              <Input
                placeholder="Link"
                value={newItem.link || ''}
                onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
              />
              <Button type="submit">Add Item</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {portfolioItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{item.description}</p>
            {item.imageUrl && (
              <div className="mb-4">
                <Image src={item.imageUrl} alt={item.title} width={300} height={200} objectFit="cover" />
              </div>
            )}
            {item.link && (
              <Button variant="outline" asChild>
                <a href={item.link} target="_blank" rel="noopener noreferrer">View Project</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

