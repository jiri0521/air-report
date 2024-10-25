'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'


interface AnnouncementFormProps {
  announcement?: {
    id: number
    title: string
    content: string
  }
  onClose?: () => void
}

export function AnnouncementForm({ announcement, onClose }: AnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title || '')
  const [content, setContent] = useState(announcement?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title)
      setContent(announcement.content)
    }
  }, [announcement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const url = announcement ? `/api/announcements/${announcement.id}` : '/api/announcements'
    const method = announcement ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to save announcement')
      }

      setTitle('')
      setContent('')
      router.refresh()
      if (onClose) onClose()
    } catch (error) {
      console.error('Error saving announcement:', error)
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="dark:border-gray-700">
      <CardHeader>
        <CardTitle>{announcement ? 'お知らせを編集' : '新しいお知らせを作成'}</CardTitle>
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
            />
          </div>
          <div className="flex justify-end space-x-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : (announcement ? '更新' : '作成')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}