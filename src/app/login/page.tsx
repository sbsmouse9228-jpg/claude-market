import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import KakaoLoginButton from '@/components/KakaoLoginButton'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import { getLocale } from '@/lib/i18n-server'
import { getDict } from '@/lib/i18n'
import { ShoppingBag } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && !user.is_anonymous) redirect('/')

  const locale = await getLocale()
  const t = getDict(locale)

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-gray-950 flex items-center justify-center">
            <ShoppingBag size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase mt-2">Claude Market</h1>
          <p className="text-sm text-gray-500">{t.login_subtitle}</p>
        </div>

        <Suspense>
          <div className="w-full flex flex-col items-center gap-3">
            <KakaoLoginButton label={t.login_kakao} />
            <GoogleLoginButton label={t.login_google} />
          </div>
        </Suspense>

        <p className="text-xs text-gray-400">{t.login_terms}</p>
      </div>
    </main>
  )
}
