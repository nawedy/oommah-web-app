'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Mail } from 'lucide-react'

export default function AuthForm() {
  const [email, setEmail] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement email authentication logic
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logo.png"
            alt="Oommah Logo"
            width={64}
            height={64}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-primary">Continue with Oommah</h1>
          <p className="text-sm text-gray-600">
            Sign in to Oommah using your preferred method.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary-light">
            Continue with Email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            SAML SSO
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          {"Don't have an account? "}
          <Link href="/signup" className="font-medium text-primary hover:text-primary-light">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

