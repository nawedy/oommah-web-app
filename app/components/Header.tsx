'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, PlusSquare, User, LogOut, MessageCircle, Users, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import SearchBar from './SearchBar'
import NotificationCenter from './NotificationCenter'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-primary text-secondary-white p-4" role="banner">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" aria-label="Home">
            <Image src="/logo.png" alt="" width={40} height={40} />
          </Link>
          <h1 className="text-2xl font-bold ml-2">Oommah</h1>
        </div>
        <nav className="hidden md:flex flex-grow mx-4" aria-label="Main navigation">
          <SearchBar />
        </nav>
        <button
          className="md:hidden"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
        <ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 absolute md:relative top-full left-0 right-0 bg-primary md:bg-transparent p-4 md:p-0`} id="mobile-menu">
          <li>
            <Link href="/gram" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange">
              Oommah Gram
            </Link>
          </li>
          <li>
            <Link href="/threads" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange">
              Oommah Threads
            </Link>
          </li>
          <li>
            <Link href="/feed" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange">
              Feed
            </Link>
          </li>
          <li>
            <Link href="/communities" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange">
              Communities
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link href="/messages" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange" aria-label="Messages">
                  <MessageCircle />
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange" aria-label="Create Post">
                  <PlusSquare />
                </Link>
              </li>
              <li>
                <Link href={`/profile/${user.username}`} className="text-secondary-white hover:text-secondary-orange focus:outline-none focus:ring-2 focus:ring-secondary-orange" aria-label="Profile">
                  <User />
                </Link>
              </li>
              <li>
                <NotificationCenter />
              </li>
              <li>
                <button 
                  onClick={logout} 
                  className="bg-secondary-orange text-primary px-4 py-2 rounded hover:bg-secondary-blue focus:outline-none focus:ring-2 focus:ring-secondary-orange"
                >
                  Logout
                </button>
              </li>
            </>
          )}
          {!user && (
            <li>
              <Link href="/login">
                <Button className="bg-secondary-orange text-primary hover:bg-secondary-blue focus:outline-none focus:ring-2 focus:ring-secondary-orange">Login</Button>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  )
}

