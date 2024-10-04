'use client'

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Bell, Menu, User } from "lucide-react"
import Header from "./header"

export function NavComponent() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="https://air-video.vercel.app/_next/image?url=%2Fimages%2Ficon-512.png&w=128&q=75"
                alt="Logo"
                className="h-10 w-50 mr-2"
              />
              <span className="text-xl font-bold text-gray-900"></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link
                    href="/"
                    className={`text-gray-600 hover:text-gray-900 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className={`text-gray-600 hover:text-gray-900 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    作成
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports"
                    className={`text-gray-600 hover:text-gray-900 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    一覧
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className={`text-gray-600 hover:text-gray-900 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    分析
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className={`text-gray-600 hover:text-gray-900 ${isActive('/settings') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    設定
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Input
                type="search"
                placeholder="検索..."
                className="w-64"
              />
            </div>
            <Button variant="ghost" size="icon" aria-label="通知">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>相和 太郎</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>プロフィール</DropdownMenuItem>
                <DropdownMenuItem>設定</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className={`block text-gray-600 hover:text-gray-900 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className={`block text-gray-600 hover:text-gray-900 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    作成
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports"
                    className={`block text-gray-600 hover:text-gray-900 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    一覧
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className={`block text-gray-600 hover:text-gray-900 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    分析
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className={`block text-gray-600 hover:text-gray-900 ${isActive('/settings') ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={handleLinkClick}
                  >
                    設定
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}