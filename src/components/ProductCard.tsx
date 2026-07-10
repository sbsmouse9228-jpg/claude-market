import Link from 'next/link'
import Image from 'next/image'
import { Product, CATEGORY_LABEL } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all group">
        {/* 썸네일 */}
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon category={product.category} />
            </div>
          )}
          <span className="absolute top-2 left-2 text-xs px-2 py-1 bg-white/90 text-gray-700 rounded-full font-medium border border-gray-100">
            {CATEGORY_LABEL[product.category]}
          </span>
        </div>

        {/* 정보 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-sm leading-snug">
            {product.title}
          </h3>
          {product.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-600">
              {product.price === 0 ? '무료' : formatPrice(product.price)}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Download size={12} />
              {product.download_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    prompt: '🤖',
    starter: '⚡',
    notion: '📋',
    design: '🎨',
  }
  return <span className="text-4xl">{icons[category] ?? '📦'}</span>
}
