export interface Product {
  id: string
  name: string
  price: number
  category: string
  barcode?: string
  image?: string
  stock?: number
  description?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: string
  name: string
  color?: string
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  paymentMethod: 'cash' | 'card' | 'insurance'
  customerId?: string
  createdAt: Date
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  insuranceInfo?: {
    provider: string
    policyNumber: string
  }
}
