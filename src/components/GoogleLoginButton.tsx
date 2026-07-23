'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

export default function GoogleLoginButton({ label = '구글로 시작하기' }: { label?: string }) {
  const searchParams = useSearchParams()

  async function handleLogin() {
    const supabase = createClient()
    const redirectTo = searchParams.get('redirect') ?? '/'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full max-w-xs px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
    >
      <GoogleIcon />
      {label}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458a5.52 5.52 0 0 1-2.394 3.622v3.011h3.878c2.269-2.089 3.578-5.166 3.578-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.956-1.075 7.942-2.907l-3.878-3.011c-1.075.72-2.45 1.145-4.064 1.145-3.125 0-5.771-2.111-6.715-4.947H1.276v3.109A11.995 11.995 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.285 14.28A7.213 7.213 0 0 1 4.909 12c0-.791.136-1.56.376-2.28V6.611H1.276a11.995 11.995 0 0 0 0 10.778l4.009-3.109z" />
      <path fill="#EA4335" d="M12 4.773c1.762 0 3.344.605 4.587 1.794l3.442-3.442C17.951 1.19 15.235 0 12 0A11.995 11.995 0 0 0 1.276 6.611l4.009 3.109C6.229 6.884 8.875 4.773 12 4.773z" />
    </svg>
  )
}
