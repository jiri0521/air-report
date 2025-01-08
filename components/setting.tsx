"use client";

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, User, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from "@/hooks/use-toast"
import UserList from '@/components/userList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type ActiveUser = {
  id: string;
  name: string;
  role: string;
  lastLogin: string;
  lastLogout: string;
};

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [language, setLanguage] = useState('日本語')
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [role, setRole] = useState('ADMIN')
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [mounted, setMounted] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const fetchActiveUsers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/user/logged-in');
      if (response.ok) {
        const users = await response.json();
        setActiveUsers(users);
      } else {
        throw new Error('Failed to fetch active users');
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
      toast({
        title: "エラー",
        description: "アクティブユーザーの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true)
    if (status === 'authenticated' && session?.user) {
      fetchUserSettings()
      setRole(session.user.role)
      fetchActiveUsers()
    }
  }, [status, session, fetchActiveUsers])

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

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return format(date, 'yyyy年MM月dd日 HH時mm分', { locale: ja });
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">設定</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="display">表示</TabsTrigger>
          <TabsTrigger value="data">データ</TabsTrigger>
          <TabsTrigger value="users">アクティブ</TabsTrigger>
          {session?.user.role === 'ADMIN' && <TabsTrigger value="permissions">権限</TabsTrigger>}
        </TabsList>
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

        <TabsContent value="users">
          <Card className='dark:border-white'>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>アクティブユーザー</span>
                <Button onClick={fetchActiveUsers} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? '更新中...' : '更新'}
                </Button>
              </CardTitle>
              <CardDescription>過去1時間以内にアクティブだったユーザーの一覧です。</CardDescription>
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <div className="flex justify-center items-center h-20">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {activeUsers.map((user) => (
                    <li key={user.id} className="flex flex-col space-y-1 border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span>{user.name}</span>
                        <span className="text-sm text-gray-500">(権限：{user.role})</span>
                      </div>
                      <div className="text-sm text-gray-400 ml-7">
                        <div>最終ログイン: {formatDateTime(user.lastLogin)}</div>
                        <div>最終ログアウト: {formatDateTime(user.lastLogout)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {!isRefreshing && activeUsers.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  過去1時間以内にアクティブだったユーザーはいません。
                </p>
              )}
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


