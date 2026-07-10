import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { CATEGORY_LABEL, type ProductCategory } from '@/types'
import { formatPrice } from '@/lib/utils'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) redirect('/')

  const { data: profile } = await supabase.from('users').select('nickname').eq('id', user.id).single()

  // service_role로 비공개 상품 포함 전체 조회
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: products }, { data: recentOrders }] = await Promise.all([
    admin.from('products').select('*').order('created_at', { ascending: false }),
    admin.from('orders').select('*, product:products(title), buyer:users(nickname)')
      .eq('status', 'paid').order('paid_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = recentOrders?.reduce((sum, o) => sum + o.amount, 0) ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header userNickname={profile?.nickname} isAdmin />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + 상품 등록
          </Link>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="전체 상품" value={String(products?.length ?? 0)} />
          <StatCard label="공개 상품" value={String(products?.filter(p => p.is_published).length ?? 0)} />
          <StatCard label="총 매출 (최근 10건)" value={formatPrice(totalRevenue)} />
        </div>

        {/* 상품 목록 */}
        <section className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">상품 목록</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {products && products.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">상품명</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">카테고리</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">가격</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">다운로드</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{product.title}</td>
                      <td className="px-4 py-3 text-gray-500">{CATEGORY_LABEL[product.category as ProductCategory]}</td>
                      <td className="px-4 py-3 text-gray-700">{product.price === 0 ? '무료' : formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.is_published ? '공개' : '비공개'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.download_count}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          수정
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">등록된 상품이 없어요</div>
            )}
          </div>
        </section>

        {/* 최근 주문 */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3">최근 구매 (최근 10건)</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {recentOrders && recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">구매자</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">상품명</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">금액</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">결제일</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-gray-700">{(order.buyer as { nickname: string } | null)?.nickname}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{(order.product as { title: string } | null)?.title}</td>
                      <td className="px-4 py-3 text-gray-700">{order.amount === 0 ? '무료' : formatPrice(order.amount)}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {order.paid_at && new Date(order.paid_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">구매 내역이 없어요</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
