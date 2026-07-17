'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

export default function KakaoLoginButton({ label = '카카오로 시작하기' }: { label?: string }) {
  const searchParams = useSearchParams()

  async function handleLogin() {
    const supabase = createClient()
    const redirectTo = searchParams.get('redirect') ?? '/'

    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scopes: 'profile_nickname profile_image',
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full max-w-xs px-6 py-3.5 rounded-xl font-semibold text-[#3C1E1E] bg-[#FEE500] hover:bg-[#F6DC00] transition-colors shadow-sm"
    >
      <KakaoIcon />
      {label}
    </button>
  )
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.736 1.606 5.14 4.035 6.572l-.985 3.65a.3.3 0 0 0 .455.327l4.284-2.83A10.7 10.7 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
    </svg>
  )
}
