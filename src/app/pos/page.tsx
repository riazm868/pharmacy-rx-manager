'use client'

import { useState } from 'react'
import ProductGrid from '@/components/pos/ProductGrid'
import ShoppingCart from '@/components/pos/ShoppingCart'
import CategoryFilter from '@/components/pos/CategoryFilter'
import SearchBar from '@/components/pos/SearchBar'
import { Product, CartItem } from '@/lib/pos/types'

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left side - Product selection */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <div className="flex-1 overflow-auto">
          <ProductGrid
            category={selectedCategory}
            searchQuery={searchQuery}
            onProductClick={addToCart}
          />
        </div>
      </div>

      {/* Right side - Shopping cart */}
      <div className="w-96 bg-white shadow-lg">
        <ShoppingCart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
        />
      </div>
    </div>
  )
}
