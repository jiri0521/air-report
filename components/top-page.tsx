'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, PieChart, Settings, Clock, Stamp, AlertTriangleIcon, Pen, Bell } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Incident = {
  id: number
  occurrenceDateTime: string
  category: string
  impactLevel: string
  countermeasures: string | null
  comment: string | null
}

type Announcement = {
  id: number
  title: string
  content: string
  createdAt: string
}

export function TopPage() {
  const [latestReports, setLatestReports] = useState<Incident[]>([])
  const [noCountermeasuresReports, setNoCountermeasuresReports] = useState<Incident[]>([])
  const [unapprovedReports, setUnapprovedReports] = useState<Incident[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsResponse, announcementsResponse] = await Promise.all([
          fetch('/api/incidents?page=1&perPage=5&sortField=occurrenceDateTime&sortOrder=desc'),
          fetch('/api/announcements?limit=5')
        ])

        if (!incidentsResponse.ok || !announcementsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const incidentsData = await incidentsResponse.json()
        const announcementsData = await announcementsResponse.json()

        setLatestReports(incidentsData.incidents)
        setNoCountermeasuresReports(incidentsData.incidents.filter((incident: Incident) => !incident.countermeasures))
        setUnapprovedReports(incidentsData.incidents.filter((incident: Incident) => !incident.comment))
        setAnnouncements(announcementsData.announcements)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pen className="mr-2 text-orange-500" />
                  新規作成
                </CardTitle>
                <CardDescription>インシデントを報告する</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-500 dark:bg-gray-500 dark:text-white" asChild>
                  <Link href="/create">レポート作成</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 text-blue-500" />
                  レポート一覧
                </CardTitle>
                <CardDescription>過去のレポートを確認</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-blue-800 dark:bg-gray-800 dark:text-white" asChild>
                  <Link href="/reports">一覧を見る</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 text-green-500" />
                  統計情報
                </CardTitle>
                <CardDescription>インシデントの分析</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-blue-800 dark:bg-gray-800 dark:text-white" asChild>
                  <Link href="/analytics">統計を見る</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 text-gray-500" />
                  設定
                </CardTitle>
                <CardDescription>システム設定</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-blue-800 dark:bg-gray-800 dark:text-white" asChild>
                  <Link href="/settings">設定を開く</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 text-blue-500" />
                  最新のレポート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>カテゴリー</TableHead>
                      <TableHead>影響度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                        <TableCell>{report.category}</TableCell>
                        <TableCell>{report.impactLevel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangleIcon className="mr-2 text-red-500" />
                  未対策のレポート
                  <Badge variant="destructive" className="ml-2 rounded-full">
                    {noCountermeasuresReports.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>カテゴリー</TableHead>
                      <TableHead>影響度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {noCountermeasuresReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                        <TableCell>{report.category}</TableCell>
                        <TableCell>{report.impactLevel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stamp className="mr-2 text-green-500" />
                  未承認のレポート
                  <Badge variant="destructive" className="ml-2 rounded-full">
                    {unapprovedReports.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>カテゴリー</TableHead>
                      <TableHead>影響度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unapprovedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                        <TableCell>{report.category}</TableCell>
                        <TableCell>{report.impactLevel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 text-yellow-500" />
                  お知らせ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="mb-4 p-4 border-b dark:border-gray-700">
                      <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(announcement.createdAt)}</p>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
   
      <footer className="bg-white shadow mt-8 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm dark:text-white">
            © 2024 医療安全インシデントレポートシステム. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}