"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, ArrowUp } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"


interface Incident {
  id: number
  patientId: string | null
  patientGender: string
  patientAge: string
  department: string
  patientRespirator: string
  patientDialysis: string
  involvedPartyProfession: string
  involvedPartyExperience: string
  involvedPartyName: string | null
  discovererProfession: string
  discovererName: string | null
  occurrenceDateTime: string
  location: string
  reportToDoctor: string | null
  reportToSupervisor: string | null
  category: string
  medicationDetail: string | null
  tubeDetail: string | null
  lifeThreat: string
  trustImpact: string
  impactLevel: string
  cause: string | null
  details: string
  summary: string | null
  workStatus: string
  involvedPartyFactors: string[]
  workBehavior: string[]
  physicalCondition: string[]
  psychologicalState: string[]
  medicalEquipment: string[]
  medication: string[]
  system: string[]
  cooperation: string[]
  explanation: string[]
  countermeasures: string | null
  comment: string | null
  status: string
  userId: string
}

export default function IncidentDetailPage() {
  const { id } = useParams()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const [showScrollTop, setShowScrollTop] = useState(false)

  const isAdminOrManager = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"
  const isOwner = session?.user?.id === incident?.userId

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/incidents/${id}`)
        if (!response.ok) {
          throw new Error("インシデント情報の取得に失敗しました")
        }
        const data = await response.json()
        setIncident(data)
      } catch (err) {
        console.error("Error fetching incident:", err)
        setError("インシデント情報の取得に失敗しました。")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchIncident()
    }
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A"
    try {
      return format(new Date(dateTime), "yyyy年MM月dd日 HH時mm分", { locale: ja })
    } catch (e) {
      console.error("Date formatting error:", e)
      return dateTime
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getLabelBackgroundColor = (field: string, value: string) => {
    if (field === "category") return "bg-yellow-200"
    if (field === "lifeThreat" && ["高い", "きわめて高い", "死亡"].includes(value)) return "bg-red-200"
    if (field === "trustImpact" && value === "大きく損なう") return "bg-red-200"
    if (field === "impactLevel" && ["レベル3b", "レベル4", "レベル5"].includes(value)) return "bg-red-200"
    return "bg-gray-100"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-[768px] p-10">
        <Card className="shadow-xl">
          <div className="px-5 py-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-[768px] p-10">
        <h1 className="text-2xl font-bold mb-4">エラー</h1>
        <Card className="shadow-xl">
          <div className="px-5 py-8">
            <p className="text-red-500">{error}</p>
            <div className="mt-4">
              <Link href="/incidents">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  インシデント一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="container mx-auto max-w-[768px] p-10">
        <h1 className="text-2xl font-bold mb-4">エラー</h1>
        <Card className="shadow-xl">
          <div className="px-5 py-8">
            <p className="text-red-500">インシデントが見つかりません。</p>
            <div className="mt-4">
              <Link href="/incidents">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  インシデント一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-[768px] p-10">
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <p>インシデントID: {incident.id}</p>
          
          </div>
          <div className="flex gap-2">
            <Link href="/incidents">
              <Button variant="outline" size="sm" className="flex items-center gap-2 print:hidden">
                <ArrowLeft size={16} />
                一覧に戻る
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="flex items-center gap-2 print:hidden" onClick={handlePrint}>
              <Printer size={16} />
              印刷
            </Button>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">インシデント詳細</h1>

      <Card className="shadow-xl print:shadow-none">
        <div className="px-5 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">患者情報</h3>
              <div className="space-y-2">
                <DetailItem label="患者名" value={incident.patientId} />
                <DetailItem label="性別" value={incident.patientGender} />
                <DetailItem label="年齢" value={incident.patientAge} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">属性</h3>
              <div className="space-y-2">
                <DetailItem label="人工呼吸器" value={incident.patientRespirator} />
                <DetailItem label="透析" value={incident.patientDialysis} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-md dark:bg-gray-800 dark:text-white">
            <div>
              <h3 className="font-semibold mb-2">発見者情報</h3>
              <div className="space-y-2">
                <DetailItem label="氏名" value={incident.discovererName} />
                <DetailItem label="職種" value={incident.discovererProfession} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">当事者情報</h3>
              <div className="space-y-2">
                {(isAdminOrManager || isOwner) && <DetailItem label="氏名" value={incident.involvedPartyName} />}
                <DetailItem label="職種" value={incident.involvedPartyProfession} />
                <DetailItem label="経験年数" value={incident.involvedPartyExperience} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">発生情報</h3>
            <div className="space-y-2">
              <DetailItem label="発生日時" value={formatDateTime(incident.occurrenceDateTime)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="発生元の部署" value={incident.department} />
                <DetailItem label="発生場所" value={incident.location} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="医師報告日時" value={formatDateTime(incident.reportToDoctor)} />
                <DetailItem label="上司報告日時" value={formatDateTime(incident.reportToSupervisor)} />
              </div>
            </div>
          </div>

          <div className="bg-blue-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
            <h3 className="font-semibold mb-2">インシデントのカテゴリー</h3>
            <div className="px-2 py-1 rounded inline-block font-medium bg-yellow-200">{incident.category}</div>
            {incident.medicationDetail && (
              <div className="mt-2">
                <span className="font-semibold">薬物詳細:</span> {incident.medicationDetail}
              </div>
            )}
            {incident.tubeDetail && (
              <div className="mt-2">
                <span className="font-semibold">チューブ詳細:</span> {incident.tubeDetail}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
              <h3 className="font-semibold mb-2">生命への危険度</h3>
              <div
                className={`px-2 py-1 rounded inline-block font-medium ${getLabelBackgroundColor("lifeThreat", incident.lifeThreat)}`}
              >
                {incident.lifeThreat}
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
              <h3 className="font-semibold mb-2">患者・家族の信頼度</h3>
              <div
                className={`px-2 py-1 rounded inline-block font-medium ${getLabelBackgroundColor("trustImpact", incident.trustImpact)}`}
              >
                {incident.trustImpact}
              </div>
            </div>
            <div className="bg-pink-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
              <h3 className="font-semibold mb-2">影響レベル</h3>
              <div
                className={`px-2 py-1 rounded inline-block font-medium bg-pink-100 ${getLabelBackgroundColor("impactLevel", incident.impactLevel)}`}
              >
                {incident.impactLevel}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md">
            <h3 className="font-semibold mb-2">勤務状況</h3>
            <div className="px-2 py-1 rounded inline-block font-medium">{incident.workStatus}</div>
          </div>

          <hr className="border-0 h-2 bg-transparent" />

          <div className="rounded-md">
            <h3 className="font-semibold mb-2">発生の原因</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium border-b border-gray-300 pb-1">人的要因</h4>
              <FactorList title="当事者要因" factors={incident.involvedPartyFactors} />
              <FactorList title="作業行動" factors={incident.workBehavior} />
              <FactorList title="身体的状況" factors={incident.physicalCondition} />
              <FactorList title="心理的状況" factors={incident.psychologicalState} />
            </div>
            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium border-b border-gray-300 pb-1">環境・物理的要因</h4>
              <FactorList title="医療機器" factors={incident.medicalEquipment} />
              <FactorList title="薬剤" factors={incident.medication} />
              <FactorList title="システム" factors={incident.system} />
              <FactorList title="協力体制" factors={incident.cooperation} />
              <FactorList title="説明" factors={incident.explanation} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">詳細</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
              {incident.details}
            </div>
          </div>

          {incident.summary && (
            <div>
              <h3 className="font-semibold mb-2">要約</h3>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">{incident.summary}</div>
            </div>
          )}

          {incident.countermeasures && (
            <div>
              <h3 className="font-semibold mb-2">対策</h3>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
                {incident.countermeasures}
              </div>
            </div>
          )}

          {incident.comment && (
            <div>
              <h3 className="font-semibold mb-2">所属長コメント</h3>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
                {incident.comment}
              </div>
            </div>
          )}
        </div>
      </Card>

      {showScrollTop && (
        <Button
          className="fixed bottom-4 right-20 rounded-full p-2 bg-yellow-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-opacity duration-300 print:hidden"
          onClick={scrollToTop}
          aria-label="ページ上部へ戻る"
        >
          上部へ戻る
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}

function DetailItem({
  label,
  value,
  className = "",
}: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <span className="font-semibold">{label}:</span> <span>{value || "N/A"}</span>
    </div>
  )
}

function FactorList({ title, factors }: { title: string; factors: string[] }) {
  if (!factors || factors.length === 0) return null
  return (
    <div className="mb-2">
      <span className="font-medium text-gray-700">{title}:</span>
      <ul className="list-disc list-inside ml-4 mt-1">
        {factors.map((factor, index) => (
          <li key={index} className="text-sm">
            {factor}
          </li>
        ))}
      </ul>
    </div>
  )
}
