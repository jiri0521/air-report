import { useState, useEffect, useCallback} from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { useSession } from "next-auth/react"
import { format } from 'date-fns';
import party from "party-js"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type NearMissReport = {
  id: number
  department: string
  fileUrl: string
  fileType: string
  count: number
  createdAt: string
  date: string
  isDeleted: boolean
}
  
const departments = [
  '1病棟', '3病棟', '5病棟', '6病棟', '7病棟', '薬剤科', 'リハビリ科', 
  '検査科', '放射線科', '臨床工学科', '栄養科', '事務部'
]

export default function NearMissReportsPage() {
  const [nearMissReports, setNearMissReports] = useState<NearMissReport[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const [newNearMissCount, setNewNearMissCount] = useState('')
  const [newNearMissDepartment, setNewNearMissDepartment] = useState('')
  const [isNearMissDialogOpen, setIsNearMissDialogOpen] = useState(false)
  const [newNearMissFile, setNewNearMissFile] = useState<File | null>(null)
  const [newNearMissYear, setNewNearMissYear] = useState('')
  const [newNearMissMonth, setNewNearMissMonth] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/near-miss-reports')

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await response.json()
      console.log('Fetched data:', data) // Add this line for debugging
      setNearMissReports(data.nearMissReports)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('データの取得中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDate2 = (dateString: string) => {
    const yearmonth = new Date(dateString)
    return format(yearmonth, "yyyy年MM月");
  } 

  const handleAddNearMissReport = async () => {
    if (!newNearMissFile || !newNearMissDepartment || !newNearMissCount || !newNearMissYear || !newNearMissMonth) {
      alert('すべての項目を入力してください。')
      return
    }
  
    const formData = new FormData()
    formData.append('file', newNearMissFile)
    formData.append('department', newNearMissDepartment)
    formData.append('count', newNearMissCount)
    formData.append('date', `${newNearMissYear}-${newNearMissMonth.padStart(2, '0')}-01`)
  
    try {
      const response = await fetch('/api/near-miss-reports', {
        method: 'POST',
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error('Failed to add near-miss report')
      }
  
      const newReport: NearMissReport = await response.json()
      setNearMissReports([newReport, ...nearMissReports])
      setNewNearMissDepartment('')
      setNewNearMissCount('')
      setNewNearMissYear('')
      setNewNearMissMonth('')
      setNewNearMissFile(null)
      setIsNearMissDialogOpen(false)
      party.confetti(document.body, {
        count: party.variation.range(20, 200)
      })
    } catch (error) {
      console.error('Error adding near-miss report:', error)
    }
  }

  const handleDeleteNearMissReport = async (id: number) => {
    if (!confirm('このヒヤリハットを削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/near-miss-reports?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete near-miss report')
      }

      setNearMissReports(nearMissReports.filter(report => report.id !== id))
    } catch (error) {
      console.error('Error deleting near-miss report:', error)
    }
  }

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
              <AlertTriangle className="mr-2 text-yellow-500" />
              ヒヤリハットレポート
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsNearMissDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> 追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : nearMissReports.length === 0 ? (
              <p>ヒヤリハットレポートがありません。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ファイル</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>部署</TableHead>  
                    <TableHead>件数</TableHead>
                    {session?.user.role === 'ADMIN' && (
                      <TableHead>操作</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nearMissReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {report.fileType.startsWith('image/') ? (
                          <img src={report.fileUrl} alt={report.department} className="w-16 h-16 object-cover" />
                        ) : (
                          <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>{formatDate2(report.date)}</TableCell>
                      <TableCell>{report.department}</TableCell>
                      <TableCell>{report.count}</TableCell>
                      {session?.user.role === 'ADMIN' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNearMissReport(report.id)}
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
       <Dialog open={isNearMissDialogOpen} onOpenChange={setIsNearMissDialogOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>ヒヤリハットレポートを追加</DialogTitle>
         </DialogHeader>
         <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label htmlFor="near-miss-department">部署</Label>
             <Select
               value={newNearMissDepartment}
               onValueChange={setNewNearMissDepartment}
             >
               <SelectTrigger id="near-miss-department">
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
               <Label htmlFor="near-miss-year">年</Label>
               <Input
                 id="near-miss-year"
                 type="number"
                 value={newNearMissYear}
                 onChange={(e) => setNewNearMissYear(e.target.value)}
                 placeholder="YYYY"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="near-miss-month">月</Label>
               <Input
                 id="near-miss-month"
                 type="number"
                 value={newNearMissMonth}
                 onChange={(e) => setNewNearMissMonth(e.target.value)}
                 placeholder="MM"
                 min="1"
                 max="12"
               />
             </div>
           </div>
           <div className="space-y-2">
             <Label htmlFor="near-miss-count">ヒヤリハット件数</Label>
             <Input
               id="near-miss-count"
               type="number"
               value={newNearMissCount}
               onChange={(e) => setNewNearMissCount(e.target.value)}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="near-miss-file">ファイル（画像またはPDF）</Label>
             <Input
               id="near-miss-file"
               type="file"
               accept="image/*,.pdf"
               onChange={(e) => setNewNearMissFile(e.target.files?.[0] || null)}
             />
           </div>
         </div>
         <Button onClick={handleAddNearMissReport}>追加</Button>
       </DialogContent>
     </Dialog>
      )}
    </div>
  )
}
