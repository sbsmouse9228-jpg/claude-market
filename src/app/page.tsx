import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { CATEGORY_LABEL, type ProductCategory } from '@/types'

interface Props {
  searchParams: Promise<{ category?: string }>
}

const CATEGORIES = Object.entries(CATEGORY_LABEL) as [ProductCategory, string][]

export default async function HomePage({ searchParams }: Props) {
  const { category } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('users').select('nickname').eq('id', user.id).single()
    if (!data) {
      await supabase.from('users').insert({
        id: user.id,
        kakao_id: user.user_metadata?.provider_id ?? null,
        nickname: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '사용자',
        profile_image: user.user_metadata?.avatar_url ?? null,
      })
    }
    profile = data
  }

  const isAdmin = user?.id === process.env.ADMIN_USER_ID

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (category && CATEGORIES.some(([k]) => k === category)) {
    query = query.eq('category', category)
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen flex flex-col">
      <Header userNickname={profile?.nickname} isAdmin={isAdmin} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* 히어로 — 뉴욕 에디토리얼 스타일 */}
        <div className="mb-10 pb-10 border-b border-gray-950 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="inline-block w-10 h-1 bg-amber-400 mb-6" aria-hidden />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950 leading-tight">
              디지털 상품 마켓
            </h1>
          </div>
          <p className="text-sm text-gray-500 tracking-wide sm:pb-1">
            AI 프롬프트 <span className="text-gray-300 mx-1">/</span> 스타터킷 <span className="text-gray-300 mx-1">/</span> Notion 템플릿 <span className="text-gray-300 mx-1">/</span> 디자인 에셋
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap mb-10">
          <FilterChip href="/" label="전체" active={!category} />
          {CATEGORIES.map(([key, label]) => (
            <FilterChip
              key={key}
              href={`/?category=${key}`}
              label={label}
              active={category === key}
            />
          ))}
        </div>

        {/* 상품 그리드 — 넓은 간격으로 명확한 구분 */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="text-4xl mb-4">📦</span>
            <p className="text-gray-400">
              {category ? '해당 카테고리에 상품이 없어요' : '아직 등록된 상품이 없어요'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors ${
        active
          ? 'bg-gray-950 text-white border-gray-950'
          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-950 hover:text-gray-950'
      }`}
    >
      {label}
    </a>
  )
}
