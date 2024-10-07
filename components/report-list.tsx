'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, AlertTriangle, FileText, Pen } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import party from "party-js"
import IncidentForm from './incident-form'

// Supabaseクライアントの初期化
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export type Incident = {
  id: number
  patientGender: string
  patientAge: string
  patientRespirator: string
  patientDialysis: string
  involvedPartyProfession: string
  involvedPartyExperience: string
  discovererProfession: string
  occurrenceDateTime: string
  location: string
  reportToDoctor: string
  reportToSupervisor: string
  category: string
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
}

export default function ReportListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Incident>('occurrenceDateTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  const itemsPerPage = 10

  const fetchIncidents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('incidents')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order(sortField, { ascending: sortOrder === 'asc' })

      if (searchTerm) {
        query = query.or(`details.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,involvedPartyProfession.ilike.%${searchTerm}%`)
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory)
      }

      const { data, error, count } = await query

      if (error) throw error

      setIncidents(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [currentPage, searchTerm, sortField, sortOrder, filterCategory])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
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

  const handleFilterCategory = (category: string) => {
    setFilterCategory(category)
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
      const { error } = await supabase
        .from('incidents')
        .update(updatedIncident)
        .eq('id', updatedIncident.id)

      if (error) throw error

      setIncidents(incidents.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc))
      party.confetti(document.body, {
        count: party.variation.range(20, 200)
      })
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Error updating incident:', err)
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

  

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>エラーが発生しました: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">インシデントレポート一覧</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>検索とフィルター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">検索</Label>
            <Input
              id="search"
              type="text"
              placeholder="キーワードを入力..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div>
            <Label htmlFor="category-filter">カテゴリーフィルター</Label>
            <Select value={filterCategory} onValueChange={handleFilterCategory}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="薬物">薬物</SelectItem>
                <SelectItem value="検査">検査</SelectItem>
                <SelectItem value="チューブ類抜去">チューブ類抜去</SelectItem>
                <SelectItem value="転倒転落">転倒転落</SelectItem>
                <SelectItem value="栄養">栄養</SelectItem>
                <SelectItem value="接遇">接遇</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm overflow-x-auto">
        <span className='text-gray-500 text-sm'>※影響度が3b,4,5は<span className='text-pink-500 text-sm dark:text-pink-400'>背景or文字が赤色です</span></span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-sm">詳細</TableHead>
              <TableHead className="w-[120px] text-sm">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('occurrenceDateTime')}>発生日時</Button>
              </TableHead>
              <TableHead className="w-[80px] text-sm">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('category')}>カテゴリー</Button>
              </TableHead>
              <TableHead className="w-[80px]">
                <Button className='text-sm'  variant="ghost" onClick={() => handleSort('impactLevel')}>影響度</Button>
              </TableHead>           
              <TableHead className="w-[120px]">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('countermeasures')}>対策</Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('location')}>発生場所</Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button className='text-sm' variant="ghost" onClick={() => handleSort('involvedPartyProfession')}>当事者職種</Button>
              </TableHead>
              <TableHead className="w-[80px] text-sm">編集</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id} className={getRowBackgroundColor(incident.impactLevel)}>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(incident)}>
                    <FileText className='text-blue-500'/>
                  </Button>
                </TableCell>              
                <TableCell className='text-sm'>{formatDate(incident.occurrenceDateTime)}</TableCell>
                <TableCell className='text-sm'>{incident.category}</TableCell>
                <TableCell className='text-sm'>{incident.impactLevel}</TableCell>
                <TableCell>
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
                    <Badge variant="destructive" className="items-center bg-orange-400 text-sm" onClick={() => handleViewDetails(incident)}>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      未対策
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-sm'>{incident.location}</TableCell>
                <TableCell className='text-sm'>{incident.involvedPartyProfession}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(incident)}>
                    <Pen className='text-green-500'/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          className='bg-blue-500'
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> 前ページ
        </Button>
        <span>ページ {currentPage} / {totalPages}</span>
        <Button
          className='bg-blue-500'
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          次ページ <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>インシデント詳細 (ID: {selectedIncident?.id})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              {selectedIncident && (
                <>
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
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">当事者の職種:</div>
                    <div className="col-span-2">{selectedIncident.involvedPartyProfession}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">当事者の経験年数:</div>
                    <div className="col-span-2">{selectedIncident.involvedPartyExperience}</div>
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
                    <div className="font-semibold">要約:</div>
                    <div className="col-span-2">{selectedIncident.summary}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-semibold">対策:</div>
                    <div className="col-span-2">{selectedIncident.countermeasures || '未対策'}</div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            }}
              onSubmit={handleUpdateIncident}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}