'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  seller: {
    id: string
    name: string
    rating: number
  }
}

interface MarketplaceContextType {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  addProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  updateProduct: (productId: string, updatedProduct: Partial<Product>) => void
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          const response = await fetch('/api/marketplace/products')
          const data = await response.json()
          setProducts(data)
        } catch (error) {
          console.error('Error fetching products:', error)
        }
      }
    }

    fetchProducts()
  }, [user])

  const addProduct = (product: Product) => {
    setProducts((prevProducts) => [product, ...prevProducts])
  }

  const removeProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
  }

  const updateProduct = (productId: string, updatedProduct: Partial<Product>) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, ...updatedProduct } : product
      )
    )
  }

  return (
    <MarketplaceContext.Provider value={{ products, setProducts, addProduct, removeProduct, updateProduct }}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider')
  }
  return context
}

