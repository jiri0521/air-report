'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type Announcement = {
  id: number
  title: string
  content: string
  createdAt: string
}

export default function AnnouncementPage() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (!params || typeof params.id !== 'string') {
          throw new Error('Invalid announcement ID')
        }
        const response = await fetch(`/api/announcements/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch announcement')
        }
        const data = await response.json()
        setAnnouncement(data)
      } catch (error) {
        console.error('Error fetching announcement:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncement()
  }, [params])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Button onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
        </Button>
        <Card className="dark:border-gray-700">
          <CardContent>
            <p className="text-red-500">エラー: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Button onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
        </Button>
        <Card className="dark:border-gray-700">
          <CardContent>
            <p>お知らせが見つかりませんでした。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Button onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
      </Button>
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle>{announcement.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            作成日: {formatDate(announcement.createdAt)}
          </p>
          <p className="whitespace-pre-wrap">{announcement.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}