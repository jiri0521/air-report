'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [language, setLanguage] = useState('日本語')
  const { theme, setTheme } = useTheme()
  

  // Ensure theme is only accessed on the client side
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return null // または、ローディング表示を返す
  }
  const handleSave = () => {
    // Here you would typically save the settings to your backend
    console.log('Settings saved:', { name, email, emailNotifications, pushNotifications, theme, fontSize, language })
  }

  const handleExportData = () => {
    // Here you would typically implement the data export logic
    console.log('Exporting data...')
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">設定</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="display">表示</TabsTrigger>
          <TabsTrigger value="language">言語</TabsTrigger>
          <TabsTrigger value="data">データ</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle>プロフィール設定</CardTitle>
              <CardDescription>あなたの個人情報を更新します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">名前</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>通知の受け取り方を設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">メール通知</Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">プッシュ通知</Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle>表示設定</CardTitle>
              <CardDescription>アプリケーションの表示方法を設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="theme">テーマ</Label>
                <div className="flex items-center space-x-2">
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="テーマを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">ライト</SelectItem>
                      <SelectItem value="dark">ダーク</SelectItem>
                      <SelectItem value="system">システム設定に従う</SelectItem>
                    </SelectContent>
                  </Select>
                  <ThemeToggle />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="font-size">文字サイズ</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="文字サイズを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle>言語設定</CardTitle>
              <CardDescription>アプリケーションの表示言語を設定します。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label htmlFor="language">言語</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="日本語">日本語</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="中文">中文</SelectItem>
                    <SelectItem value="한국어">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
              <CardDescription>データのエクスポートや削除を行います。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleExportData} className="w-full">
                <Download className="mr-2 h-4 w-4" /> データをエクスポート
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
