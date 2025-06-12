'use client'

import { Category } from '@/lib/pos/types'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories: Category[] = [
  { id: 'all', name: 'All Products', color: 'bg-gray-500' },
  { id: 'otc', name: 'Over the Counter', color: 'bg-blue-500' },
  { id: 'vitamins', name: 'Vitamins', color: 'bg-green-500' },
  { id: 'medical-supplies', name: 'Medical Supplies', color: 'bg-purple-500' },
  { id: 'personal-care', name: 'Personal Care', color: 'bg-pink-500' },
  { id: 'prescription', name: 'Prescription', color: 'bg-red-500' },
]

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
            ${selectedCategory === category.id
              ? `${category.color} text-white shadow-lg scale-105`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
