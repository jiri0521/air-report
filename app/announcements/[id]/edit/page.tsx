'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
}

export default function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/announcements/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch announcement')
        }
        const data = await response.json()
        setAnnouncement(data)
        setTitle(data.title)
        setContent(data.content)
      } catch (error) {
        console.error('Error fetching announcement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncement()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/announcements/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update announcement')
      }
      router.push('/announcements')
    } catch (error) {
      console.error('Error updating announcement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!announcement) {
    return <div className="flex justify-center items-center h-screen">Announcement not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => router.push('/announcements')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
      </Button>
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle>お知らせを編集</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="dark:border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="dark:border-gray-700"
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push('/announcements')}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}