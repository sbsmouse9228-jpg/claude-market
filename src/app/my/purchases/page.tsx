import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { getLocale } from '@/lib/i18n-server'
import { getDict, CATEGORY_LABELS, formatPriceLocale } from '@/lib/i18n'
import type { ProductCategory } from '@/types'
import { Download } from 'lucide-react'

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/my/purchases')

  const locale = await getLocale()
  const t = getDict(locale)

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('users').select('nickname').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('buyer_id', user.id)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false }),
  ])

  const isAdmin = user.id === process.env.ADMIN_USER_ID

  return (
    <div className="min-h-screen flex flex-col">
      <Header userNickname={profile?.nickname} isAdmin={isAdmin} locale={locale} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t.purchases_title}</h1>

        {orders && orders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const product = order.product as {
                id: string; title: string; category: ProductCategory; thumbnail_url: string | null; price: number
              }
              if (!product) return null
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  {/* 썸네일 */}
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-100 overflow-hidden relative">
                    {product.thumbnail_url ? (
                      <Image src={product.thumbnail_url} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {product.category === 'prompt' ? '🤖' :
                         product.category === 'starter' ? '⚡' :
                         product.category === 'notion' ? '📋' : '🎨'}
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-600 font-medium mb-0.5">
                      {CATEGORY_LABELS[locale][product.category]}
                    </p>
                    <Link href={`/product/${product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.amount === 0 ? t.free : formatPriceLocale(order.amount, locale)} ·{' '}
                      {order.paid_at && new Date(order.paid_at).toLocaleDateString(
                        locale === 'ko' ? 'ko-KR' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' },
                      )}
                    </p>
                  </div>

                  {/* 다운로드 */}
                  <a
                    href={`/api/download/${product.id}`}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Download size={14} />
                    {t.purchases_get}
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl mb-4">🛍️</span>
            <p className="text-gray-400 mb-4">{t.purchases_empty}</p>
            <Link href="/" className="text-sm text-indigo-600 font-medium hover:underline">
              {t.purchases_browse}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
