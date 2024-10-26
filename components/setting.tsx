"use client";

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from "@/hooks/use-toast"
import SessionData from "@/components/session-data";
import UserList from '@/components/userList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function SettingsPage() {
  const [name, setName] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [language, setLanguage] = useState('日本語')
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [role, setRole] = useState('ADMIN')

  const [mounted, setMounted] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === 'authenticated' && session?.user) {
      fetchUserSettings()
      setRole(session.user.role)
      console.log(" ログイン中の権限:", role)
    }
  }, [status, session])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const settings = await response.json()
        setName(settings.name || '')
        setEmailNotifications(settings.emailNotifications)
        setPushNotifications(settings.pushNotifications)
        setFontSize(settings.fontSize)
        setLanguage(settings.language)
        setRole(settings.role)
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          emailNotifications,
          pushNotifications,
          fontSize,
          language,
          theme,
        }),
      })

      if (response.ok) {
        setIsSuccessModalOpen(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "設定の保存中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    // Implement data export logic here
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
          <TabsTrigger value="data">データ</TabsTrigger>
          {session?.user.role === 'ADMIN' && <TabsTrigger value="permissions">権限</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card className='dark:border-gray-700'>
            <CardHeader>
              <CardTitle>プロフィール設定</CardTitle>
              <CardDescription>あなたの個人情報を更新します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 dark:border-gray-700">
              <div className="space-y-1">
                <Label htmlFor="name">名前</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className='dark:border-gray-700'/>
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
                <Label htmlFor="email-notifications"className='dark:border-gray-700'>メール通知</Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className='dark:border-gray-700'
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">プッシュ通知</Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className='dark:border-gray-700'
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
                    <SelectTrigger id="theme" className='dark:border-gray-700'>
                      <SelectValue placeholder="テーマを選択" />
                    </SelectTrigger>
                    <SelectContent className='dark:border-gray-700'>
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
                  <SelectTrigger id="font-size" className='dark:border-gray-700'>
                    <SelectValue placeholder="文字サイズを選択" />
                  </SelectTrigger>
                  <SelectContent className='dark:border-gray-700'>
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

        {session?.user.role === 'ADMIN' && (
          <TabsContent value="permissions">
          <Card className='dark:border-white'>
          <CardHeader>
          <CardTitle>権限管理</CardTitle>
          <CardDescription>ユーザーの権限を管理します。</CardDescription>
          </CardHeader>
          <CardContent>
          <UserList />
          </CardContent>
          </Card>
          </TabsContent>
          )}
      </Tabs>
      <br></br><br></br>
      <SessionData session={session} />
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-300">
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-xl font-bold text-blue-600">成功</DialogTitle>
              <DialogDescription className="text-gray-600">
                ユーザーの設定が変更されました。
              </DialogDescription>
            </DialogHeader>
            <div className="">
              {/* アイコンや画像をここに追加する場合は、ここに記述 */}
            </div>
            <Button
              onClick={() => setIsSuccessModalOpen(false)} 
              className="w-full mt-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
