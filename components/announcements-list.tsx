'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnnouncementForm } from "./announcement-form"
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  content: string
  createdAt: string
}

interface AnnouncementListProps {
  announcements: Announcement[]
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (confirm('本当にこのお知らせを削除しますか？')) {
      try {
        const response = await fetch(`/api/announcements/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete announcement')
        }

        router.refresh()
      } catch (error) {
        console.error('Error deleting announcement:', error)
  
      }
    }
  }

  return (
    <Card className="dark:border-gray-700">
      <CardHeader>
        <CardTitle>お知らせ一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="mb-4 p-4 border-b dark:border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{announcement.title}</h3>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setEditingAnnouncement(announcement)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <AnnouncementForm
                        announcement={editingAnnouncement!}
                        onClose={() => setEditingAnnouncement(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(announcement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(announcement.createdAt).toLocaleString('ja-JP')}
              </p>
              <p className="mt-2">{announcement.content}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}