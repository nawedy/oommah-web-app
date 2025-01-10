'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface UserSettings {
  name: string
  bio: string
  email: string
  language: string
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  pushNotifications: boolean
  privacyMode: boolean
}

interface ProfileTheme {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

export default function UserSettingsForm() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    bio: '',
    email: '',
    language: 'en',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    privacyMode: false,
  })
  const [profileTheme, setProfileTheme] = useState<ProfileTheme>({
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    fontFamily: 'Inter, sans-serif',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/settings')
          if (response.ok) {
            const data = await response.json()
            setSettings(data)
          }
        } catch (error) {
          console.error('Error fetching user settings:', error)
        }
      }
    }

    const fetchProfileTheme = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/users/${user.id}/theme`)
          if (response.ok) {
            const data = await response.json()
            setProfileTheme(data || {
              primaryColor: '#ffffff',
              secondaryColor: '#000000',
              fontFamily: 'Inter, sans-serif',
            })
          }
        } catch (error) {
          console.error('Error fetching profile theme:', error)
        }
      }
    }

    fetchSettings()
    fetchProfileTheme()
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: keyof UserSettings
  ) => {
    const value = typeof e === 'string' ? e : e.target.value
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggle = (field: keyof UserSettings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleThemeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ProfileTheme
  ) => {
    setProfileTheme((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const settingsResponse = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const themeResponse = await fetch(`/api/users/${user.id}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileTheme),
      })

      if (settingsResponse.ok && themeResponse.ok) {
        toast({
          title: 'Settings updated',
          description: 'Your account settings and profile theme have been successfully updated.',
        })
      } else {
        throw new Error('Failed to update settings or theme')
      }
    } catch (error) {
      console.error('Error updating user settings or theme:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={settings.name}
          onChange={(e) => handleChange(e, 'name')}
          placeholder="Your name"
          aria-describedby="name-description"
        />
        <p id="name-description" className="text-sm text-gray-500 mt-1">
          This is the name that will be displayed on your profile.
        </p>
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={settings.bio}
          onChange={(e) => handleChange(e, 'bio')}
          placeholder="Tell us about yourself"
          rows={4}
          aria-describedby="bio-description"
        />
        <p id="bio-description" className="text-sm text-gray-500 mt-1">
          Write a short bio to introduce yourself to other users.
        </p>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={settings.email}
          onChange={(e) => handleChange(e, 'email')}
          placeholder="Your email address"
          aria-describedby="email-description"
        />
        <p id="email-description" className="text-sm text-gray-500 mt-1">
          This email will be used for account-related notifications.
        </p>
      </div>
      <div>
        <Label htmlFor="language">Language</Label>
        <Select value={settings.language} onValueChange={(value) => handleChange(value, 'language')}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="theme">Theme</Label>
        <Select value={settings.theme} onValueChange={(value) => handleChange(value, 'theme')}>
          <SelectTrigger id="theme">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="primaryColor">Primary Color</Label>
        <Input
          id="primaryColor"
          type="color"
          value={profileTheme.primaryColor}
          onChange={(e) => handleThemeChange(e, 'primaryColor')}
          aria-describedby="primary-color-description"
        />
        <p id="primary-color-description" className="text-sm text-gray-500 mt-1">
          Choose the main color for your profile theme.
        </p>
      </div>
      <div>
        <Label htmlFor="secondaryColor">Secondary Color</Label>
        <Input
          id="secondaryColor"
          type="color"
          value={profileTheme.secondaryColor}
          onChange={(e) => handleThemeChange(e, 'secondaryColor')}
          aria-describedby="secondary-color-description"
        />
        <p id="secondary-color-description" className="text-sm text-gray-500 mt-1">
          Choose the accent color for your profile theme.
        </p>
      </div>
      <div>
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select value={profileTheme.fontFamily} onValueChange={(value) => setProfileTheme(prev => ({ ...prev, fontFamily: value }))}>
          <SelectTrigger id="fontFamily">
            <SelectValue placeholder="Select a font family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
            <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
            <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
            <SelectItem value="Lato, sans-serif">Lato</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="emailNotifications" className="flex-grow">Email Notifications</Label>
        <Switch
          id="emailNotifications"
          checked={settings.emailNotifications}
          onCheckedChange={() => handleToggle('emailNotifications')}
          aria-describedby="email-notifications-description"
        />
      </div>
      <p id="email-notifications-description" className="text-sm text-gray-500 mt-1">
        Receive email notifications for important updates and activities.
      </p>
      <div className="flex items-center justify-between">
        <Label htmlFor="pushNotifications" className="flex-grow">Push Notifications</Label>
        <Switch
          id="pushNotifications"
          checked={settings.pushNotifications}
          onCheckedChange={() => handleToggle('pushNotifications')}
          aria-describedby="push-notifications-description"
        />
      </div>
      <p id="push-notifications-description" className="text-sm text-gray-500 mt-1">
        Receive push notifications on your device for real-time updates.
      </p>
      <div className="flex items-center justify-between">
        <Label htmlFor="privacyMode" className="flex-grow">Privacy Mode</Label>
        <Switch
          id="privacyMode"
          checked={settings.privacyMode}
          onCheckedChange={() => handleToggle('privacyMode')}
          aria-describedby="privacy-mode-description"
        />
      </div>
      <p id="privacy-mode-description" className="text-sm text-gray-500 mt-1">
        Enable privacy mode to limit the visibility of your profile and activities.
      </p>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </form>
  )
}

