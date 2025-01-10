import { ReactNode } from 'react'
import Header from './Header'
import { AuthProvider } from '../contexts/AuthContext'
import { PostsProvider } from '../contexts/PostsContext'
import { ThreadsProvider } from '../contexts/ThreadsContext'
import { MarketplaceProvider } from '../contexts/MarketplaceContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <PostsProvider>
        <ThreadsProvider>
          <MarketplaceProvider>
            <div className="min-h-screen flex flex-col">
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-white p-2 z-50">
                Skip to main content
              </a>
              <Header />
              <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="bg-primary text-secondary-white py-4" role="contentinfo">
                <div className="container mx-auto px-4 text-center">
                  © 2023 Oommah. All rights reserved.
                </div>
              </footer>
            </div>
          </MarketplaceProvider>
        </ThreadsProvider>
      </PostsProvider>
    </AuthProvider>
  )
}

