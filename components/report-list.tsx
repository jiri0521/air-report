'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, AlertTriangle, FileText, Pen, Trash2, CloudUpload, Stamp, Printer, Menu, X, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import party from "party-js"
import IncidentForm from './incident-form'
import { useSession } from 'next-auth/react'
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export type Incident = {
  id: number
  patientId: string
  patientGender: string
  patientAge: string
  department: string
  patientRespirator: string
  patientDialysis: string
  involvedPartyProfession: string
  involvedPartyExperience: string
  involvedPartyName: string | null
  discovererName: string | null
  discovererProfession: string
  occurrenceDateTime: string
  location: string
  reportToDoctor: string
  reportToSupervisor: string
  category: string
  medicationDetail: string // New field for detailed medication category
  tubeDetail: string,
  lifeThreat: string
  trustImpact: string
  impactLevel: string
  cause: string[]
  details: string
  summary: string
  workStatus: string
  involvedPartyFactors: string[] | null
  workBehavior: string[] | null
  physicalCondition: string[] | null
  psychologicalState: string[] | null
  medicalEquipment: string[] | null
  medication: string[] | null
  system: string[] | null
  cooperation: string[] | null
  explanation: string[] | null
  countermeasures: string | null
  comment: string
  isDeleted: boolean
  userId: string
}

export default function ReportListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [debouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Incident>('occurrenceDateTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory] = useState('all')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  

 // 印刷機能を実装する関数
 const handlePrint = () => {
  if (printRef.current) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>インシデント詳細印刷</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 8px; }
              .font-semibold { font-weight: 600; }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }
};

const handlePrintBlankPage = () => {
  const blankPage = `
    <html>
      <head>
        <title>カンファレンス用紙</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .content {
            border: 1px solid black;
            width: 80%;
            height: 80%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            text-align: center;
          }
          h2 {
            margin-top: 20px;
            font-size: 18px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>カンファレンス用紙</h1>
          <p>レポートID: ${selectedIncident?.id}</p>
          <p>詳細: ${selectedIncident?.details}</p>
        </div>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(blankPage);
    printWindow.document.close();
    printWindow.print();
  }
};



 
  const itemsPerPage = 10

  const [showDeleted,setShowDeleted] = useState(false)
  const { data: session } = useSession()
  const isAdminOrManager = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [filterYear] = useState<string>('')
  const [filterMonth] = useState<string>('')
  const [isFilterCardOpen, setIsFilterCardOpen] = useState(true)
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    patientIdSearch: '',
    filterCategory: 'all',
    filterYear: '',
    filterMonth: '',
  })
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [localPatientIdSearch] = useState('')
  const [localFilterCategory, setLocalFilterCategory] = useState('all')
  const [localFilterYear, setLocalFilterYear] = useState('')
  const [localFilterMonth, setLocalFilterMonth] = useState('')

  const router = useRouter()

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/incidents?page=${currentPage}&perPage=${itemsPerPage}&sortField=${sortField}&sortOrder=${sortOrder}&search=${searchParams.searchTerm}&category=${searchParams.filterCategory}&showDeleted=${showDeleted}&patientId=${searchParams.patientIdSearch}&year=${searchParams.filterYear}&month=${searchParams.filterMonth}`)
      if (!response.ok) {
        throw new Error('Failed to fetch incidents')
      }
      const data = await response.json()
      setIncidents(data.incidents)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, searchParams, showDeleted])


  useEffect(() => {
    fetchIncidents()
  }, [currentPage, sortField, sortOrder, showDeleted, fetchIncidents])

  const handleSearch = () => {
    setCurrentPage(1)
    setSearchParams({
      searchTerm: localSearchTerm,
      patientIdSearch: localPatientIdSearch,
      filterCategory: localFilterCategory,
      filterYear: localFilterYear,
      filterMonth: localFilterMonth,
    })
    fetchIncidents()
  }


  useEffect(() => {
    fetchIncidents()
  }, [currentPage, debouncedSearchTerm, sortField, sortOrder, filterCategory, showDeleted, fetchIncidents, filterYear, filterMonth])

 
  const toggleFilterCard = () => {
    setIsFilterCardOpen(!isFilterCardOpen)
  }


  const handleSort = (field: keyof Incident) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }



  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident)
    setIsDetailsDialogOpen(true)
  }

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(incident)
    setIsEditDialogOpen(true)
  }

  const handleUpdateIncident = async (updatedIncident: Incident) => {
    try {
      // Format date-time fields
      const formattedIncident = {
        ...updatedIncident,
        occurrenceDateTime: new Date(updatedIncident.occurrenceDateTime).toISOString(),
        reportToDoctor: new Date(updatedIncident.reportToDoctor).toISOString(),
        reportToSupervisor: new Date(updatedIncident.reportToSupervisor).toISOString(),
        involvedPartyName: updatedIncident.involvedPartyName || '', // null の場合は空文字列にする
        discovererName: updatedIncident.discovererName || '',
        medicationDetail: updatedIncident.medicationDetail || '',
        location: updatedIncident.location || '', // Ensure location is included
      };
  
      const response = await fetch(`/api/incidents/${formattedIncident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedIncident),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update incident')
      }
  
      const updatedData = await response.json()
      setIncidents(incidents.map(inc => inc.id === updatedData.id ? updatedData : inc))
      party.confetti(document.body, {
        count: party.variation.range(20, 200)
      })
      setIsSuccessModalOpen(true)
      setIsEditDialogOpen(false) // Close the edit dialog after successful update
    } catch (err) {
      console.error('Error updating incident:', err)
      toast({
        title: "エラー",
        description: err instanceof Error ? err.message : "インシデントの更新中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  const getRowBackgroundColor = (impactLevel: string) => {
    const highImpactLevels = ['レベル3b', 'レベル4', 'レベル5']
    return highImpactLevels.includes(impactLevel) ? 'bg-pink-100 dark:bg-gray-600 text-pink-400' : ''
  }

  const handleDelete = async (incident: Incident) => {
    if (confirm('このインシデントを削除しますか？')) {
      try {
        const response = await fetch(`/api/incidents?id=${incident.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete incident')
        }

        fetchIncidents()
      } catch (err) {
        console.error('Error deleting incident:', err)
      }
    }
  }

  const handleRestore = async (incident: Incident) => {
    if (confirm('このインシデントを復元しますか？')) {
      try {
        const response = await fetch(`/api/restore-incidents?id=${incident.id}`, {
          method: 'PUT',
        })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore incident')
      }

      await fetchIncidents()
      toast({
        title: "インシデントが復元されました",
        description: "インシデントが正常に復元されました。",
        variant: "default",
      })
    } catch (err) {
      console.error('Error restoring incident:', err)
      toast({
        title: "エラー",
        description: err instanceof Error ? err.message : "インシデントの復元中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }}

  const CardSkeleton = () => (
    <Card className="mb-4 dark:border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-[100px]" />
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">インシデントレポート一覧</h1>
        <CardSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) return <div>エラーが発生しました: {error}</div>

  const handleReload = () => {
    router.refresh() // Refresh React Server Components
    window.location.reload() // Force a full browser refresh
  }

  if (!session?.user?.staffNumber) {
    return (
      <div className="container mx-auto max-w-[768px] p-10">
        <h1 className="text-2xl font-bold mb-4">エラー</h1>
        <Card className="shadow-xl">
          <div className="px-5 py-8">
          <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-1/4" />
          
          <br></br>
        正常に表示されない場合、<br></br>
        下のボタンを押してください。
        <br></br>
        <Button onClick={handleReload} className="bg-blue-200 text-blue-800 ml-2 hover:text-pink-100">
            ログイン情報を再取得
          </Button>
          </div>
        </Card>
      </div>
    )
  }



  return (
    <div className="container mx-auto p-4">

      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <p>職員番号: {session?.user?.staffNumber}</p>
        <p>{session?.user?.name}さんがログインしていますか？</p>
        <p>
          違う場合は
          <Button onClick={handleReload} className="bg-gray-200 text-blue-500 ml-2">
            ここをクリック
          </Button>
        </p>
      </div>
      <h1 className="text-2xl font-bold mb-4">インシデントレポート一覧</h1>

      <Card className="mb-4 dark:border-gray-700 max-w-[768px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>検索とフィルター</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFilterCard}
            aria-label={isFilterCardOpen ? "Close filter" : "Open filter"}
          >
              {isFilterCardOpen ? (
                  <>
                    <X />
                    <span>検索窓を閉じる</span>
                  </>
                ) : (
                  <>
                    <Menu />
                    <span>検索窓を開く</span>
                  </>
                )}
          </Button>
        </CardHeader>
        {isFilterCardOpen && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="searchTerm">フリー検索</Label>
                <Input
                  id="searchTerm"
                  name="searchTerm"
                  type="text"
                  placeholder="キーワードを入力..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="dark:border-gray-700"
                />
              </div>
             
            </div>
            <div>
              <Label htmlFor="filterCategory">カテゴリーフィルター</Label>
              <Select value={localFilterCategory} onValueChange={setLocalFilterCategory}>
                <SelectTrigger id="filterCategory" className="dark:border-gray-700">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="薬物">薬物</SelectItem>
                  <SelectItem value="検査">検査</SelectItem>
                  <SelectItem value="チューブ類">チューブ類</SelectItem>
                  <SelectItem value="転倒転落">転倒転落</SelectItem>
                  <SelectItem value="栄養">栄養</SelectItem>
                  <SelectItem value="接遇">接遇</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterYear">年</Label>
                <Select value={localFilterYear} onValueChange={setLocalFilterYear}>
                  <SelectTrigger id="filterYear" className="dark:border-gray-700">
                    <SelectValue placeholder="年を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterMonth">月</Label>
                <Select value={localFilterMonth} onValueChange={setLocalFilterMonth}>
                  <SelectTrigger id="filterMonth" className="dark:border-gray-700">
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>{month}月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {session?.user.role === 'ADMIN' && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-deleted">削除済みを表示</Label>
                <input
                  type="checkbox"
                  id="show-deleted"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                />
              </div>
            )}
            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="text-sm overflow-x-auto">
       
        <span className='text-gray-500 text-sm'>※影響度が3b,4,5は<span className='text-pink-500 text-sm dark:text-pink-400'>背景or文字が赤色です</span></span>
         <br></br>
         <br></br>
         <Table>
          <TableHeader>
            <TableRow className="dark:border-gray-700">
              <TableHead className="w-[80px] text-sm dark:border-gray-700">詳細</TableHead>
              <TableHead className="w-[120px] text-sm dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('department')}>部署</Button>
              </TableHead>
              <TableHead className="w-[120px] text-sm dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('occurrenceDateTime')}>発生日時</Button>
              </TableHead>
              <TableHead className="w-[80px] text-sm dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('category')}>カテゴリー</Button>
              </TableHead>
              <TableHead className="w-[80px] dark:border-gray-700">
                <Button className='text-sm'  variant="ghost" onClick={() => handleSort('impactLevel')}>影響度</Button>
              </TableHead>           
              <TableHead className="w-[120px] dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('countermeasures')}>対策</Button>
              </TableHead>
              <TableHead className="w-[120px] dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('location')}>発生場所</Button>
              </TableHead>
              <TableHead className="w-[120px] dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('involvedPartyProfession')}>当事者職種</Button>
              </TableHead>
              <TableHead className="w-[80px] dark:border-gray-700">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('comment')}>コメント</Button>
              </TableHead>  
            {session?.user.role === 'ADMIN' && (          
              <TableHead className="w-[80px] text-sm dark:border-gray-700">編集</TableHead> 
            )}            
              {session?.user.role === 'ADMIN' && (
              <TableHead className="w-[80px] text-sm dark:border-gray-700">操作</TableHead>
            )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
               <TableRow key={incident.id} className={`${getRowBackgroundColor(incident.impactLevel)} dark:border-gray-700`}>
                <TableCell className="dark:border-gray-700">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(incident)}>閲覧
                    <FileText className='text-blue-500'/>
                  </Button>
                </TableCell>
                <TableCell className='text-sm dark:border-gray-700'>{incident.department}</TableCell>              
                <TableCell className='text-sm dark:border-gray-700'>{formatDate(incident.occurrenceDateTime)}</TableCell>
                <TableCell className='text-sm dark:border-gray-700'>{incident.category}</TableCell>
                <TableCell className='text-sm dark:border-gray-700'>{incident.impactLevel}</TableCell>
                <TableCell className="dark:border-gray-700">
                  {incident.countermeasures ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate w-[100px] text-sm">{incident.countermeasures}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{incident.countermeasures}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="destructive" className="items-center bg-orange-400 text-sm" onClick={() => handleEdit(incident)}>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      未対策
                    </Badge>
                  )}
                </TableCell>            
                <TableCell className='text-sm dark:border-gray-700'>{incident.location}</TableCell>
                <TableCell className='text-sm dark:border-gray-700'>{incident.involvedPartyProfession}</TableCell>
                <TableCell >
                  {incident.comment ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate w-[100px] text-sm">{incident.comment}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{incident.comment}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="destructive" className="items-center bg-green-500 text-sm dark:border-gray-700" onClick={() => handleEdit(incident)}>
                      <Stamp className="w-4 h-4 mr-1" />
                      未承認
                    </Badge>
                  )}
                </TableCell>
                {session?.user.role === 'ADMIN' && (
                <TableCell className="dark:border-gray-700">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(incident)}>
                    <Pen className='text-green-500'/>
                  </Button>
                </TableCell>
                )}
                {session?.user.role === 'ADMIN' && (
                  <TableCell>
                    {incident.isDeleted ? (
                      <Button variant="outline" size="sm" onClick={() => handleRestore(incident)}>
                        <div className="relative inline-block w-7 h-7"> {/* アイコンのコンテナ */}
                          <CloudUpload className="w-full h-full text-blue-200" /> {/* アイコン */}
                          <span className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold pointer-events-none">
                            {"復元"}
                          </span> {/* 中央に配置されたテキスト */}
                        </div>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(incident)}>
                        <div className="relative inline-block w-7 h-7"> {/* アイコンのコンテナ */}
                          <Trash2 className="w-full h-full text-red-200" /> {/* アイコン */}
                          <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold pointer-events-none">
                            {"削除"}
                          </span> {/* 中央に配置されたテキスト */}
                        </div>
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          className='bg-blue-500 dark:bg-white'
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> 前ページ
        </Button>
        <span>ページ {currentPage} / {totalPages}</span>
        <Button
          className='bg-blue-500 dark:bg-white'
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          次ページ <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    <form ref={formRef}>
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            インシデント詳細 (ID: {selectedIncident?.id})
            <div className="flex space-x-2">
              <Button type="button" onClick={handlePrint} className="ml-auto bg-gray-500 dark:bg-green-300">
                <Printer className="mr-2" />
                レポート印刷
              </Button>
              <Button type="button" onClick={handlePrintBlankPage} className="bg-blue-500 dark:bg-blue-300">
                <Printer className="mr-2" />
                カンファ印刷
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          <div ref={printRef} className="space-y-2">
              {selectedIncident && (
                <>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">患者ID:</div>
                    <div className="col-span-2">{selectedIncident.patientId}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">患者の性別:</div>
                    <div className="col-span-2">{selectedIncident.patientGender}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">患者の年齢:</div>
                    <div className="col-span-2">{selectedIncident.patientAge}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">呼吸器の有無:</div>
                    <div className="col-span-2">{selectedIncident.patientRespirator}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">透析の有無:</div>
                    <div className="col-span-2">{selectedIncident.patientDialysis}</div>
                  </div>
                  {(isAdminOrManager || session?.user?.id === selectedIncident.userId) && (
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-semibold">当事者の氏名:</div>
                      <div className="col-span-2">{selectedIncident.involvedPartyName}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">当事者の職種:</div>
                    <div className="col-span-2">{selectedIncident.involvedPartyProfession}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">当事者の経験年数:</div>
                    <div className="col-span-2">{selectedIncident.involvedPartyExperience}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">部署:</div>
                    <div className="col-span-2">{selectedIncident.department}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">発見者の氏名:</div>
                    <div className="col-span-2">{selectedIncident.discovererName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">発見者の職種:</div>
                    <div className="col-span-2">{selectedIncident.discovererProfession}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">発生日時:</div>
                    <div className="col-span-2">{formatDate(selectedIncident.occurrenceDateTime)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">発生場所:</div>
                    <div className="col-span-2">{selectedIncident.location}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">医師への報告日時:</div>
                    <div className="col-span-2">{formatDate(selectedIncident.reportToDoctor)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">所属長への報告日時:</div>
                    <div className="col-span-2">{formatDate(selectedIncident.reportToSupervisor)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">カテゴリー:</div>
                    <div className="col-span-2">{selectedIncident.category}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">薬物詳細:</div>
                    <div className="col-span-2">{selectedIncident.medicationDetail}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">チューブ類詳細:</div>
                    <div className="col-span-2">{selectedIncident.tubeDetail}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">生命への危険度:</div>
                    <div className="col-span-2">{selectedIncident.lifeThreat}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">患者・家族の信頼度:</div>
                    <div className="col-span-2">{selectedIncident.trustImpact}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">影響レベル:</div>
                    <div className="col-span-2">{selectedIncident.impactLevel}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">勤務状況:</div>
                    <div className="col-span-2">{selectedIncident.workStatus}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">発生の原因:</div>
                    {Array.isArray(selectedIncident.cause) ? selectedIncident.cause.join(', ') : ''}
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">当事者の要因:</div>
                    <div className="col-span-2">{selectedIncident.involvedPartyFactors?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">作業行動:</div>
                    <div className="col-span-2">{selectedIncident.workBehavior?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">身体的状態:</div>
                    <div className="col-span-2">{selectedIncident.physicalCondition?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">心理的状態:</div>
                    <div className="col-span-2">{selectedIncident.psychologicalState?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">医療機器:</div>
                    <div className="col-span-2">{selectedIncident.medicalEquipment?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">薬剤:</div>
                    <div className="col-span-2">{selectedIncident.medication?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">システム:</div>
                    <div className="col-span-2">{selectedIncident.system?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">連携:</div>
                    <div className="col-span-2">{selectedIncident.cooperation?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">説明:</div>
                    <div className="col-span-2">{selectedIncident.explanation?.join(', ') || ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">詳細:</div>
                    <div className="col-span-2">{selectedIncident.details}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">対策:</div>
                    <div className="col-span-2">{selectedIncident.countermeasures || '未対策'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">所属長のコメント:</div>
                    <div className="col-span-2">{selectedIncident.comment || '未承認'}</div>
                  </div>
                 
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </form>
    
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} >
        <ScrollArea>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>インシデント編集 (ID: {selectedIncident?.id})</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <IncidentForm
            initialData={{
              ...selectedIncident,
              workBehavior: selectedIncident.workBehavior || [],
              physicalCondition: selectedIncident.physicalCondition || [], // ここを修正
              psychologicalState: selectedIncident.psychologicalState || [], // ここを修正
              medicalEquipment: selectedIncident.medicalEquipment || [], // ここを修正
              medication: selectedIncident.medication || [], // ここを修正
              system: selectedIncident.system || [], // ここを修正
              cooperation: selectedIncident.cooperation || [], // ここを修正
              explanation: selectedIncident.explanation || [], // ここを修正
              patientId: selectedIncident.patientId || '', // 追加: patientIdを初期データに含める
              involvedPartyName: selectedIncident.involvedPartyName || '', // ここを修正
              discovererName: selectedIncident.discovererName || '', // 追加
              medicationDetail: selectedIncident.medicationDetail || '',
              tubeDetail: selectedIncident.tubeDetail || '',
              location: selectedIncident.location || '', // Ensure location is included
            }}
              onSubmit={handleUpdateIncident}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
        </ScrollArea>
      </Dialog>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent >
          <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-300">
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-xl font-bold text-blue-600">成功</DialogTitle>
              <DialogDescription className="text-gray-600">
                インシデントレポートが修正されました。
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