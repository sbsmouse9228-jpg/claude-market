import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { CATEGORY_LABELS, formatPriceLocale, getDict, type Locale } from '@/lib/i18n'
import { Download } from 'lucide-react'

export default function ProductCard({ product, locale = 'ko' }: { product: Product; locale?: Locale }) {
  const t = getDict(locale)

  return (
    <Link href={`/product/${product.id}`} className="h-full">
      {/* 뉴욕 에디토리얼 스타일: 직각 모서리 + 강한 보더로 카드 구분 */}
      <div className="bg-white border-2 border-gray-200 overflow-hidden hover:border-gray-950 transition-all group h-full flex flex-col">
        {/* 썸네일 */}
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden border-b-2 border-gray-200 group-hover:border-gray-950 transition-colors">
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
          <span className="absolute top-0 left-0 text-[10px] px-2.5 py-1.5 bg-gray-950 text-white font-semibold uppercase tracking-wider">
            {CATEGORY_LABELS[locale][product.category]}
          </span>
        </div>

        {/* 정보 */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-950 line-clamp-2 mb-1 text-sm leading-snug">
            {product.title}
          </h3>
          {product.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <span className="font-black text-gray-950">
              {product.price === 0 ? t.free : formatPriceLocale(product.price, locale)}
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
