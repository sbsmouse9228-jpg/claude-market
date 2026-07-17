'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  userNickname?: string
  isAdmin?: boolean
}

export default function Header({ userNickname, isAdmin }: HeaderProps) {
  const router = useRouter()

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
                구매 목록
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-semibold text-gray-950 underline underline-offset-4 hover:bg-amber-400 transition-colors">
                  관리자
                </Link>
              )}
              <span className="text-sm text-gray-500 hidden sm:block">{userNickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-950 border border-gray-950 px-4 py-1.5 hover:bg-gray-950 hover:text-white transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
