'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDict, type Locale } from '@/lib/i18n'
import LanguageToggle from '@/components/LanguageToggle'

interface HeaderProps {
  userNickname?: string
  isAdmin?: boolean
  locale?: Locale
}

export default function Header({ userNickname, isAdmin, locale = 'ko' }: HeaderProps) {
  const router = useRouter()
  const t = getDict(locale)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b-2 border-gray-950">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 뉴욕 에디토리얼 스타일 로고: 블랙 + 택시 옐로 포인트 */}
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-gray-950 uppercase">
          <span className="w-3.5 h-3.5 bg-amber-400" aria-hidden />
          Claude Market
        </Link>
        <nav className="flex items-center gap-4">
          {userNickname ? (
            <>
              <Link href="/my/purchases" className="text-sm text-gray-600 hover:text-gray-950 transition-colors hidden sm:block">
                {t.nav_purchases}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-semibold text-gray-950 underline underline-offset-4 hover:bg-amber-400 transition-colors">
                  {t.nav_admin}
                </Link>
              )}
              <span className="text-sm text-gray-500 hidden sm:block">{userNickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t.nav_logout}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-950 border border-gray-950 px-4 py-1.5 hover:bg-gray-950 hover:text-white transition-colors"
            >
              {t.nav_login}
            </Link>
          )}
          {/* 한/영 전환 토글 */}
          <LanguageToggle locale={locale} />
        </nav>
      </div>
    </header>
  )
}
