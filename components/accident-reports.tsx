'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Plus, Pen } from 'lucide-react'
//import { useSession } from "next-auth/react"
import { format } from 'date-fns'
import Link from 'next/link'

type Incident = {
  id: number
  patientId: string
  occurrenceDateTime: string
  category: string
  impactLevel: string
  countermeasures: string | null
  comment: string | null
}

export default function AccidentReportsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
 // const { data: session } = useSession()

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents?page=1&perPage=100&sortField=occurrenceDateTime&sortOrder=desc')
        if (!response.ok) {
          throw new Error('Failed to fetch incidents')
        }
        const data = await response.json()
        setIncidents(data.incidents)
      } catch (error) {
        console.error('Error fetching incidents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy/MM/dd HH:mm")
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 text-red-500" />
              アクシデントレポート一覧
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" /> 新規作成
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>発生日時</TableHead>
                    <TableHead>カテゴリー</TableHead>
                    <TableHead>影響度</TableHead>
                    <TableHead>対策状況</TableHead>
                    <TableHead>承認状況</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>{formatDate(incident.occurrenceDateTime)}</TableCell>
                      <TableCell>{incident.category}</TableCell>
                      <TableCell>{incident.impactLevel}</TableCell>
                      <TableCell>
                        {incident.countermeasures ? '対策済み' : '未対策'}
                      </TableCell>
                      <TableCell>
                        {incident.comment ? '承認済み' : '未承認'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/incidents/${incident.id}`}>
                            <Pen className="h-4 w-4 text-blue-500" />
                          </Link>
                        </Button>
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
  )
}

