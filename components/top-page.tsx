'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, FileText, PieChart, Settings, Clock, AlertOctagon, ClipboardCheck, Stamp, AlertTriangleIcon, Pen } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Incident = {
  id: number
  occurrenceDateTime: string
  category: string
  impactLevel: string
  countermeasures: string | null
  comment: string | null
}

export function TopPage() {
  const [latestReports, setLatestReports] = useState<Incident[]>([])
  const [noCountermeasuresReports, setNoCountermeasuresReports] = useState<Incident[]>([])
  const [unapprovedReports, setUnapprovedReports] = useState<Incident[]>([])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents?page=1&perPage=5&sortField=occurrenceDateTime&sortOrder=desc')
        if (!response.ok) throw new Error('Failed to fetch incidents')
        const data = await response.json()
        
        setLatestReports(data.incidents)
        setNoCountermeasuresReports(data.incidents.filter((incident: Incident) => !incident.countermeasures))
        setUnapprovedReports(data.incidents.filter((incident: Incident) => !incident.comment))
      } catch (error) {
        console.error('Error fetching incidents:', error)
      }
    }

    fetchIncidents()
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