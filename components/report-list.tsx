'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, AlertTriangle, FileText, Pen } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import party from "party-js";

// Supabaseクライアントの初期化
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Incident = {
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
  cause: string
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
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchIncidents()
  }, [currentPage, searchTerm, sortField, sortOrder, filterCategory])

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

  const handleEditField = (field: string, value: string) => {
    setEditingField(field)
    setEditValue(value)
  }

  const handleSaveEdit = async () => {
    if (selectedIncident && editingField) {
      const { error } = await supabase
        .from('incidents')
        .update({ [editingField]: editValue })
        .eq('id', selectedIncident.id)
        .select()

      if (error) {
        console.error('Error updating incident:', error)
      } else {
        setSelectedIncident({ ...selectedIncident, [editingField]: editValue })
        fetchIncidents()
      }
      setEditingField(null)
    }
  }

  const handleConfirmAddCountermeasures = async () => {
    if (selectedIncident) {
      const { error } = await supabase
        .from('incidents')
        .update({ countermeasures: editValue })
        .eq('id', selectedIncident.id)
        .select()

      if (error) {
        console.error('Error updating countermeasures:', error)
      } else {
        setSelectedIncident({ ...selectedIncident, countermeasures: editValue })
        fetchIncidents()
      }
    }
    party.confetti(document.body, {
      count: party.variation.range(20, 200)
    })
    setIsConfirmDialogOpen(false)
    setIsDetailsDialogOpen(false)
  }

  const renderDetailRow = (label: string, value: string | string[] | null | undefined, field: string) => {
    if (value === null || value === undefined) return null
    const displayValue = Array.isArray(value) ? value.join(', ') : value

    if (isLoading) return <div>読み込み中...</div>
    if (error) return <div>エラーが発生しました: {error}</div>

    return (
      <div className="grid grid-cols-3 gap-4 py-2">
        <div className="font-semibold">{label}:</div>
        <div className="col-span-2 flex items-center">
          {editingField === field ? (
            <>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button onClick={handleSaveEdit} size="sm">保存</Button>
            </>
          ) : (
            <>
              <span className="flex-grow">{displayValue}</span>
              <Button onClick={() => handleEditField(field, displayValue)} size="sm" variant="ghost">
                <Pen className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    )
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
    return highImpactLevels.includes(impactLevel) ? 'bg-pink-100' : ''
  }

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
        <span className='text-gray-500 text-sm'>※影響度が3b,4,5は<span className='text-pink-500 text-sm'>背景赤色</span></span>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> 前ページ
        </Button>
        <span>ページ {currentPage} / {totalPages}</span>
        <Button
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
               {renderDetailRow('患者の性別', selectedIncident.patientGender, 'patientGender')}
               {renderDetailRow('患者の年齢', selectedIncident.patientAge, 'patientAge')}
               {renderDetailRow('呼吸器の有無', selectedIncident.patientRespirator, 'patientRespirator')}
               {renderDetailRow('透析の有無', selectedIncident.patientDialysis, 'patientDialysis')}
               {renderDetailRow('当事者の職種', selectedIncident.involvedPartyProfession, 'involvedPartyProfession')}
               {renderDetailRow('当事者の経験年数', selectedIncident.involvedPartyExperience, 'involvedPartyExperience')}
               {renderDetailRow('発見者の職種', selectedIncident.discovererProfession, 'discovererProfession')}
               {renderDetailRow('発生日時', selectedIncident.occurrenceDateTime, 'occurrenceDateTime')}
               {renderDetailRow('発生場所', selectedIncident.location, 'location')}
               {renderDetailRow('医師への報告日時', selectedIncident.reportToDoctor, 'reportToDoctor')}
               {renderDetailRow('所属長への報告日時', selectedIncident.reportToSupervisor, 'reportToSupervisor')}
               {renderDetailRow('カテゴリー', selectedIncident.category, 'category')}
               {renderDetailRow('生命への危険度', selectedIncident.lifeThreat, 'lifeThreat')}
               {renderDetailRow('患者・家族の信頼度', selectedIncident.trustImpact, 'trustImpact')}
               {renderDetailRow('影響レベル', selectedIncident.impactLevel, 'impactLevel')}
               {renderDetailRow('勤務状況', selectedIncident.workStatus, 'workStatus')}
               {renderDetailRow('発生の原因', selectedIncident.cause, 'cause')}
               {renderDetailRow('当事者の要因', selectedIncident.involvedPartyFactors, 'involvedPartyFactors')}
               {renderDetailRow('作業行動', selectedIncident.workBehavior, 'workBehavior')}
               {renderDetailRow('身体的状態', selectedIncident.physicalCondition, 'physicalCondition')}
               {renderDetailRow('心理的状態', selectedIncident.psychologicalState, 'psychologicalState')}
               {renderDetailRow('医療機器', selectedIncident.medicalEquipment, 'medicalEquipment')}
               {renderDetailRow('薬剤', selectedIncident.medication, 'medication')}
               {renderDetailRow('システム', selectedIncident.system, 'system')}
               {renderDetailRow('連携', selectedIncident.cooperation, 'cooperation')}
               {renderDetailRow('説明', selectedIncident.explanation, 'explanation')}
               {renderDetailRow('詳細', selectedIncident.details, 'details')}
               {renderDetailRow('要約', selectedIncident.summary, 'summary')}
               {renderDetailRow('対策', selectedIncident.countermeasures, 'countermeasures')}
             </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認</DialogTitle>
            <DialogDescription>
              この内容で登録します。よろしいですか。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label className="text-sm font-bold">新しい対策:</Label>
            <div className="mt-2 p-2 bg-gray-100 rounded-md">
              {editValue || '(対策が入力されていません)'}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmAddCountermeasures}>
              はい
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}