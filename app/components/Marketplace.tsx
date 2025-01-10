'use client'

import { useState, useEffect } from 'react'
import { useMarketplace } from '../contexts/MarketplaceContext'
import Product from './Product'

export default function Marketplace() {
  const { products } = useMarketplace()

  return (
    <div className="bg-secondary-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

