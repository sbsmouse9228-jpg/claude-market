import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import KakaoLoginButton from '@/components/KakaoLoginButton'
import { ShoppingBag } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && !user.is_anonymous) redirect('/')

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Claude Market</h1>
          <p className="text-sm text-gray-500">AI 프롬프트 · 스타터킷 · 템플릿 · 에셋</p>
        </div>

        <Suspense>
          <KakaoLoginButton />
        </Suspense>

        <p className="text-xs text-gray-400">
          로그인 시 서비스 이용약관에 동의하는 것으로 간주합니다
        </p>
      </div>
    </main>
  )
}
