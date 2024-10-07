'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, FileText, PieChart, Settings } from "lucide-react"
import Link from "next/link"

export function TopPage() {

  return (
    <div>
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 text-red-700" />
                新規作成
              </CardTitle>
              <CardDescription>インシデントを報告する</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full dark:bg-gray-500 text-white" asChild>
                <Link href="/create">レポート作成</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 text-blue-500" />
                レポート一覧
              </CardTitle>
              <CardDescription>過去のレポートを確認</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-black dark:bg-gray-800 text-white" asChild>
                <Link href="/reports">一覧を見る</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 text-green-500" />
                統計情報
              </CardTitle>
              <CardDescription>インシデントの分析</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-black dark:bg-gray-800 text-white" asChild>
                <Link href="/analytics">統計を見る</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 text-gray-500" />
                設定
              </CardTitle>
              <CardDescription>システム設定</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-black dark:bg-gray-800 text-white" asChild>
                <Link href="/settings">設定を開く</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
   
    <footer className="bg-white shadow mt-8 dark:bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 dark:bg-gray-800 text-white">
        <p className="text-center text-sm dark:bg-gray-800 text-white">
          © 2024 医療安全インシデントレポートシステム. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
  )
}