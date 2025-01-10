'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function UserOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    city: '',
    country: '',
    interests: '',
    hobbies: '',
    culturalPreference: '',
    language: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/')
      } else {
        throw new Error('Failed to update user information')
      }
    } catch (error) {
      console.error('Error during onboarding:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-primary">Welcome to Oommah!</h2>
      <p className="mb-4 text-gray-600">Please provide some information to get started:</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <Input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          required
        />
        <Input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country"
          required
        />
        <Textarea
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          placeholder="Interests (comma-separated)"
          required
        />
        <Textarea
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
          placeholder="Hobbies (comma-separated)"
          required
        />
        <Select name="culturalPreference" onValueChange={(value) => setFormData({ ...formData, culturalPreference: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select cultural preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="western">Western</SelectItem>
            <SelectItem value="eastern">Eastern</SelectItem>
            <SelectItem value="african">African</SelectItem>
            <SelectItem value="middleEastern">Middle Eastern</SelectItem>
            <SelectItem value="latinAmerican">Latin American</SelectItem>
          </SelectContent>
        </Select>
        <Select name="language" onValueChange={(value) => setFormData({ ...formData, language: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select preferred language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full bg-primary text-secondary-white hover:bg-primary-light">Complete Profile</Button>
      </form>
    </div>
  )
}

