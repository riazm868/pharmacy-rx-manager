'use client'

import { useState } from 'react'
import { CartItem } from '@/lib/pos/types'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onClearCart: () => void
}

export default function ShoppingCart({ items, onUpdateQuantity, onClearCart }: ShoppingCartProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.13 // 13% HST for Ontario
  const total = subtotal + tax

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handleCheckoutComplete = () => {
    setShowCheckout(false)
    onClearCart()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Shopping Cart</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">Cart is empty</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (HST 13%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        
        <div className="pt-4 space-y-2">
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full"
            size="lg"
          >
            Checkout
          </Button>
          <Button
            onClick={onClearCart}
            disabled={items.length === 0}
            variant="outline"
            className="w-full"
          >
            Clear Cart
          </Button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  )
}
