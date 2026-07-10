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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* 히어로 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            디지털 상품 마켓
          </h1>
          <p className="text-gray-500">AI 프롬프트 · 스타터킷 · Notion 템플릿 · 디자인 에셋</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
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

        {/* 상품 그리드 */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
      }`}
    >
      {label}
    </a>
  )
}
