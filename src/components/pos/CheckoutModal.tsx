'use client'

import { useState } from 'react'
import { CartItem } from '@/lib/pos/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditCard, DollarSign, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface CheckoutModalProps {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  onClose: () => void
  onComplete: () => void
}

export default function CheckoutModal({
  items,
  subtotal,
  tax,
  total,
  onClose,
  onComplete
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'insurance'>('cash')
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success('Payment processed successfully!')
      
      // Here we would:
      // 1. Save the sale to database
      // 2. Update inventory
      // 3. Print receipt
      // 4. Log transaction
      
      setProcessing(false)
      onComplete()
    }, 1500)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium mb-2">Order Summary</h3>
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x{item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-2">Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('insurance')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'insurance'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Insurance</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
