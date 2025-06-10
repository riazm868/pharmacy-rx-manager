'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/pos/types'
import { Card } from '@/components/ui/card'

interface ProductGridProps {
  category: string
  searchQuery: string
  onProductClick: (product: Product) => void
}

// Mock data for now - will be replaced with Supabase query
const mockProducts: Product[] = [
  { id: '1', name: 'Tylenol Extra Strength', price: 12.99, category: 'otc', image: '/api/placeholder/100/100' },
  { id: '2', name: 'Advil 200mg', price: 9.99, category: 'otc', image: '/api/placeholder/100/100' },
  { id: '3', name: 'Benadryl 25mg', price: 8.49, category: 'otc', image: '/api/placeholder/100/100' },
  { id: '4', name: 'Pepto-Bismol', price: 7.99, category: 'otc', image: '/api/placeholder/100/100' },
  { id: '5', name: 'Band-Aid Variety Pack', price: 5.99, category: 'medical-supplies', image: '/api/placeholder/100/100' },
  { id: '6', name: 'Thermometer Digital', price: 15.99, category: 'medical-supplies', image: '/api/placeholder/100/100' },
  { id: '7', name: 'Blood Pressure Monitor', price: 45.99, category: 'medical-supplies', image: '/api/placeholder/100/100' },
  { id: '8', name: 'Vitamin D 1000IU', price: 12.99, category: 'vitamins', image: '/api/placeholder/100/100' },
  { id: '9', name: 'Multivitamin Daily', price: 19.99, category: 'vitamins', image: '/api/placeholder/100/100' },
  { id: '10', name: 'Omega-3 Fish Oil', price: 24.99, category: 'vitamins', image: '/api/placeholder/100/100' },
]

export default function ProductGrid({ category, searchQuery, onProductClick }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery)
      )
    }

    setFilteredProducts(filtered)
  }, [category, searchQuery, products])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {filteredProducts.map(product => (
        <Card
          key={product.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onProductClick(product)}
        >
          <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="text-gray-400 text-xs text-center p-2">
                {product.name}
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
          {product.stock !== undefined && product.stock < 10 && (
            <p className="text-xs text-red-500">Low stock: {product.stock}</p>
          )}
        </Card>
      ))}
    </div>
  )
}
