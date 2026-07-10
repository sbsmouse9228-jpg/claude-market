import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Header from '@/components/Header'
import ProductForm from '../../ProductForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) redirect('/')

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: profile }, { data: product }] = await Promise.all([
    supabase.from('users').select('nickname').eq('id', user.id).single(),
    admin.from('products').select('*').eq('id', id).single(),
  ])

  if (!product) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Header userNickname={profile?.nickname} isAdmin />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">상품 수정</h1>
        <ProductForm initialData={product} />
      </main>
    </div>
  )
}
