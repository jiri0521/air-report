'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, PieChart, Settings, Clock, Stamp, AlertTriangle, Pen, Bell, Plus, List, User} from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import IncidentForm from "@/components/incident-form"
import party from "party-js"
import { useRouter } from "next/navigation"

type Incident = {
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
  const [userReports, setUserReports] = useState<Incident[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('')
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const router = useRouter()
 

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [incidentsResponse, announcementsResponse, userReportsResponse] = await Promise.all([
        fetch('/api/incidents?page=1&perPage=100&sortField=occurrenceDateTime&sortOrder=desc'),
        fetch('/api/announcements?limit=5'),
        fetch('/api/incidents/my-report/')
      ])

      if (!incidentsResponse.ok || !announcementsResponse.ok || !userReportsResponse.ok) {
        console.log(error)
        throw new Error('Failed to fetch data')
      }

      const incidentsData = await incidentsResponse.json()
      const announcementsData = await announcementsResponse.json()
      const userReportsData = await userReportsResponse.json()

      const allIncidents = incidentsData.incidents

      setLatestReports(allIncidents.slice(0, 5))
      setNoCountermeasuresReports(allIncidents.filter((incident: Incident) => !incident.countermeasures))
      setUnapprovedReports(allIncidents.filter((incident: Incident) => !incident.comment))
      setAnnouncements(announcementsData.announcements)
      setUserReports(userReportsData.incidents)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('データの取得中にエラーが発生しました。')
      setLoading(false)
    }
  }, [])
  

  const handleReload = () => {
    router.refresh() // Refresh React Server Components
    window.location.reload() // Force a full browser refresh
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
  }



  const handleAddAnnouncement = async () => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newAnnouncementTitle, content: newAnnouncementContent }),
      })
      party.confetti(document.body, {
        count: party.variation.range(20, 200)
      })
      if (!response.ok) {
        throw new Error('Failed to add announcement')
      }

      const newAnnouncement = await response.json()
      
      setAnnouncements([newAnnouncement, ...announcements])
      setNewAnnouncementTitle('')
      setNewAnnouncementContent('')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error adding announcement:', error)
    }
  }

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident)
  }

  const handleIncidentSubmit = async (updatedIncident: Incident) => {
    try {

      const formattedIncident = {
        ...updatedIncident,
        occurrenceDateTime: new Date(updatedIncident.occurrenceDateTime).toISOString(),
        reportToDoctor: new Date(updatedIncident.reportToDoctor).toISOString(),
        reportToSupervisor: new Date(updatedIncident.reportToSupervisor).toISOString(),
        involvedPartyName: updatedIncident.involvedPartyName || '', // null の場合は空文字列にする
        discovererName: updatedIncident.discovererName || '',
        medicationDetail: updatedIncident.medicationDetail || '',
      };


      const response = await fetch(`/api/incidents/${formattedIncident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedIncident),
      })

        party.confetti(document.body, {
          count: party.variation.range(100, 600)
        })
        setIsSuccessModalOpen(true)
       
      if (!response.ok) {
        throw new Error('Failed to update incident')
      }
     
      setSelectedIncident(null)
      fetchData() // Refresh the data after update
    } catch (error) {
      console.error('Error updating incident:', error)
    }
  }

  
  const CardSkeleton = () => (
    <Card className="dark:border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
          {/* Announcements Card - Now with a narrower width */}
          <div>
          <Button onClick={handleReload} className="flex justify-end bg-gray-200 text-gray-800 ml-2">
          ログイン情報を再取得
          </Button>
          </div>
          <div className="max-w-3xl mx-auto mb-6">
            <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="mr-2 text-yellow-500" />
                  お知らせ
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/announcements">
                      <List className="mr-2 h-4 w-4" /> 
                    </Link>
                  </Button>
                  {session?.user.role === 'ADMIN' && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" /> 追加
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>新しいお知らせを追加</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">タイトル</Label>
                            <Input
                              id="title"
                              value={newAnnouncementTitle}
                              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">内容</Label>
                            <Textarea
                              id="content"
                              value={newAnnouncementContent}
                              onChange={(e) => setNewAnnouncementContent(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddAnnouncement}>追加</Button>
                      </DialogContent>
                    </Dialog>                   
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <div key={index} className="mb-4 p-4 border-b dark:border-gray-700">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-1" />
                    </div>
                  ))
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="mb-4 p-4 border-b dark:border-gray-700">
                      <Link href={`/announcements/${announcement.id}`} className="font-semibold hover:underline">
                        {announcement.title}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(announcement.createdAt)}</p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          </div>
          </div>
          



        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
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
              </>
            )}
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
                <ScrollArea className="h-[250px]">
                  {loading ? <TableSkeleton /> : (
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
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 text-red-500" />
                  未対策のレポート
                  {loading ? (
                    <Skeleton className="ml-2 h-6 w-6 rounded-full" />
                  ) : (
                    <Badge variant="destructive" className="ml-2 rounded-full">
                      {noCountermeasuresReports.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {loading ? <TableSkeleton /> : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>カテゴリー</TableHead>
                          <TableHead>影響度</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {noCountermeasuresReports.slice(0, 5).map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                            <TableCell>{report.category}</TableCell>
                            <TableCell>{report.impactLevel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stamp className="mr-2 text-green-500" />
                  未承認のレポート
                  {loading ? (
                    <Skeleton className="ml-2 h-6 w-6 rounded-full" />
                  ) : (
                    <Badge variant="destructive" className="ml-2 rounded-full bg-green-500 hover:bg-green-400 transition-colors duration-200">
                      {unapprovedReports.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {loading ? <TableSkeleton /> : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>カテゴリー</TableHead>
                          <TableHead>影響度</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unapprovedReports.slice(0, 5).map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                            <TableCell>{report.category}</TableCell>
                            <TableCell>{report.impactLevel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 text-purple-500" />
                  自分の提出したレポート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {loading ? <TableSkeleton /> : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>カテゴリー</TableHead>
                          <TableHead>影響度</TableHead>
                          <TableHead>状態</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userReports.map((report) => (
                          <TableRow 
                            key={report.id} 
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleIncidentClick(report)}
                          >
                            <TableCell>{formatDate(report.occurrenceDateTime)}</TableCell>
                            <TableCell>{report.category}</TableCell>
                            <TableCell>{report.impactLevel}</TableCell>
                            <TableCell>
                              {!report.countermeasures ? (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">未対策</Badge>
                              ) : !report.comment ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">未承認</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800">完了</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
   
      <footer className="bg-white shadow mt-8 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm dark:text-white">
            © 2025 医療安全インシデントレポートシステム. All rights reserved.
          </p>
        </div>
      </footer>

   
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>インシデント詳細</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(90vh-100px)]">
              {selectedIncident && (
                <IncidentForm
                  initialData={{
                    ...selectedIncident,
                    workBehavior: selectedIncident.workBehavior || [],
                    physicalCondition: selectedIncident.physicalCondition || [],
                    psychologicalState: selectedIncident.psychologicalState || [],
                    medicalEquipment: selectedIncident.medicalEquipment || [],
                    medication: selectedIncident.medication || [],
                    system: selectedIncident.system || [],
                    cooperation: selectedIncident.cooperation || [],
                    explanation: selectedIncident.explanation || [],
                    patientId: selectedIncident.patientId || '',
                    involvedPartyName: selectedIncident.involvedPartyName || '',
                    discovererName: selectedIncident.discovererName || '',
                    medicationDetail: selectedIncident.medicationDetail || '',
                    tubeDetail: selectedIncident.tubeDetail || '',
                  }}
                  onSubmit={handleIncidentSubmit}
                  onCancel={() => setSelectedIncident(null)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

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