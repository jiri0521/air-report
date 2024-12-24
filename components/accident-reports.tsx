'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Plus, FileText, Trash2, X } from 'lucide-react'
import { useSession } from "next-auth/react"
import { format } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import party from "party-js"

type AccidentReport = {
  id: number
  department: string
  fileUrl: string
  fileType: string
  date: string
  createdAt: string
}

const departments = [
  '1病棟', '3病棟', '5病棟', '6病棟', '7病棟', '薬剤科', 'リハビリ科', 
  '検査科', '放射線科', '臨床工学科', '栄養科', '事務部'
]

export default function AccidentReportsPage() {
  const [accidentReports, setAccidentReports] = useState<AccidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const [isAccidentDialogOpen, setIsAccidentDialogOpen] = useState(false)
  const [newAccidentDepartment, setNewAccidentDepartment] = useState('')
  const [newAccidentYear, setNewAccidentYear] = useState('')
  const [newAccidentMonth, setNewAccidentMonth] = useState('')
  const [newAccidentFile, setNewAccidentFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fetchAccidentReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/accident-reports')
      if (!response.ok) {
        throw new Error('Failed to fetch accident reports')
      }
      const data = await response.json()
      console.log('Fetched accident reports:', data)
      setAccidentReports(data.accidentReports)
    } catch (error) {
      console.error('Error fetching accident reports:', error)
      setError('アクシデントレポートの取得中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccidentReports()
  }, [fetchAccidentReports])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy年MM月")
  }

  const handleAddAccidentReport = async () => {
    if (!newAccidentFile || !newAccidentDepartment || !newAccidentYear || !newAccidentMonth) {
      alert('すべての項目を入力してください。')
      return
    }
  
    const formData = new FormData()
    formData.append('file', newAccidentFile)
    formData.append('department', newAccidentDepartment)
    formData.append('date', `${newAccidentYear}-${newAccidentMonth.padStart(2, '0')}-01`)
  
    try {
      const response = await fetch('/api/accident-reports', {
        method: 'POST',
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error('Failed to add accident report')
      }
  
      const newReport: AccidentReport = await response.json()
      setAccidentReports([newReport, ...accidentReports])
      setNewAccidentDepartment('')
      setNewAccidentYear('')
      setNewAccidentMonth('')
      setNewAccidentFile(null)
      setIsAccidentDialogOpen(false)
      party.confetti(document.body, {
        count: party.variation.range(20, 200)
      })
    } catch (error) {
      console.error('Error adding accident report:', error)
    }
  }

  const handleDeleteAccidentReport = async (id: number) => {
    if (!confirm('このアクシデントレポートを削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/accident-reports?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete accident report')
      }

      setAccidentReports(accidentReports.filter(report => report.id !== id))
    } catch (error) {
      console.error('Error deleting accident report:', error)
    }
  }

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          {session?.user.role === 'ADMIN' && <TableHead><Skeleton className="h-4 w-16" /></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            {session?.user.role === 'ADMIN' && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="container mx-auto py-6">
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 text-red-500" />
              アクシデントレポート一覧
            </div>
            {session?.user.role === 'ADMIN' && (
              <Button variant="outline" size="sm" onClick={() => setIsAccidentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> 追加
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : accidentReports.length === 0 ? (
              <p>アクシデントレポートがありません。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ファイル</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>部署</TableHead>
                    {session?.user.role === 'ADMIN' && <TableHead>操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accidentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {report.fileType.startsWith('image/') ? (
                          <img 
                            src={report.fileUrl} 
                            alt={report.department} 
                            className="w-16 h-16 object-cover cursor-pointer" 
                            onClick={() => setSelectedImage(report.fileUrl)}
                          />
                        ) : (
                          <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(report.date)}</TableCell>
                      <TableCell>{report.department}</TableCell>
                      {session?.user.role === 'ADMIN' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccidentReport(report.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      {session?.user.role === 'ADMIN' && (
        <Dialog open={isAccidentDialogOpen} onOpenChange={setIsAccidentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>アクシデントレポートを追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="accident-department">部署</Label>
                <Select
                  value={newAccidentDepartment}
                  onValueChange={setNewAccidentDepartment}
                >
                  <SelectTrigger id="accident-department">
                    <SelectValue placeholder="部署を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accident-year">年</Label>
                  <Input
                    id="accident-year"
                    type="number"
                    value={newAccidentYear}
                    onChange={(e) => setNewAccidentYear(e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accident-month">月</Label>
                  <Input
                    id="accident-month"
                    type="number"
                    value={newAccidentMonth}
                    onChange={(e) => setNewAccidentMonth(e.target.value)}
                    placeholder="MM"
                    min="1"
                    max="12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accident-file">ファイル（画像またはPDF）</Label>
                <Input
                  id="accident-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setNewAccidentFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Button onClick={handleAddAccidentReport}>追加</Button>
          </DialogContent>
        </Dialog>
      )}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                拡大画像
                <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img src={selectedImage} alt="拡大画像" className="w-full h-auto" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

