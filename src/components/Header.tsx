'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag } from 'lucide-react'

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
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <ShoppingBag size={20} />
          Claude Market
        </Link>
        <nav className="flex items-center gap-4">
          {userNickname ? (
            <>
              <Link href="/my/purchases" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                구매 목록
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
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
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
