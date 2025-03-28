"use client"

import type React from "react"
import { useState, useEffect  } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: string
  staffNumber: string
}

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
  discovererProfession: string
  involvedPartyName: string | null
  discovererName: string | null
  occurrenceDateTime: string
  location: string
  reportToDoctor: string
  reportToSupervisor: string
  category: string
  medicationDetail: string // New field for detailed medication category
  tubeDetail: string
  lifeThreat: string
  trustImpact: string
  impactLevel: string
  cause: string[]
  details: string
  summary: string
  workStatus: string
  involvedPartyFactors: string[] | null
  workBehavior: string[]
  physicalCondition: string[]
  psychologicalState: string[]
  medicalEquipment: string[]
  medication: string[]
  system: string[]
  cooperation: string[]
  explanation: string[]
  countermeasures: string | null
  comment: string
  isDeleted: boolean
  userId: string
  status?: string
}

type FactorsCheckboxesProps = {
  formData: Incident
  setFormData: React.Dispatch<React.SetStateAction<Incident>>
}

const HumanFactorsCheckboxes: React.FC<FactorsCheckboxesProps> = ({ formData, setFormData }) => {
  const updateHumanFactors = (
    category: "involvedPartyFactors" | "workBehavior" | "physicalCondition" | "psychologicalState",
    item: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const updatedCategory = checked
        ? [...(prev[category] ?? []), item]
        : (prev[category] ?? []).filter((i) => i !== item)

      const hasHumanFactors =
        [
          ...(updatedCategory ?? []), // 修正: null の場合は空配列を使用
          ...(prev.involvedPartyFactors ?? []),
          ...(prev.workBehavior ?? []),
          ...(prev.physicalCondition ?? []),
          ...(prev.psychologicalState ?? []),
        ].length > 0

      return {
        ...prev,
        [category]: updatedCategory,
        cause: hasHumanFactors
          ? Array.from(new Set([...prev.cause, "人的要因"]))
          : prev.cause.filter((c) => c !== "人的要因"),
      }
    })
  }

  const renderCheckboxes = (
    category: "involvedPartyFactors" | "workBehavior" | "physicalCondition" | "psychologicalState",
    items: string[],
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-${item}`}
            checked={formData[category]?.includes(item) ?? false} // nullチェックを追加
            onCheckedChange={(checked) => updateHumanFactors(category, item, checked as boolean)}
          />
          <Label htmlFor={`${category}-${item}`} className="text-sm">
            {item}
          </Label>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">当事者の要因</h3>
        {renderCheckboxes("involvedPartyFactors", [
          "判断誤り",
          "確認不足",
          "観察不足",
          "知識不足",
          "知識誤り",
          "認識不足",
          "経験不足",
          "技術未熟",
          "技術誤り",
          "その他",
        ])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">作業行動</h3>
        {renderCheckboxes("workBehavior", [
          "手順を守らなかった",
          "やりにくかった",
          "作業の中断があった",
          "同時に複数の作業をした",
          "初めての作業だった",
          "その他",
        ])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">身体的状態</h3>
        {renderCheckboxes("physicalCondition", [
          "寝不足",
          "体調不良",
          "眠くなる薬を飲んでいた",
          "怪我をしていた",
          "その他",
        ])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">心理的状態</h3>
        {renderCheckboxes("psychologicalState", [
          "慌てていた",
          "思い込み",
          "面倒だった",
          "変だと気づいていたが言えなかった",
          "イライラ",
          "緊張",
          "無意識",
          "他のことに気を取られていた",
          "大丈夫だと思った",
          "その他",
        ])}
      </div>
    </div>
  )
}

const EnvironmentalFactorsCheckboxes: React.FC<FactorsCheckboxesProps> = ({ formData, setFormData }) => {
  const updateEnvironmentalFactors = (
    category: "medicalEquipment" | "medication" | "system" | "cooperation" | "explanation",
    item: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const updatedCategory = checked
        ? [...(prev[category] || []), item]
        : (prev[category] || []).filter((i) => i !== item)

      const hasEnvironmentalFactors =
        [
          ...updatedCategory,
          ...(prev.medicalEquipment || []),
          ...(prev.medication || []),
          ...(prev.system || []),
          ...(prev.cooperation || []),
          ...(prev.explanation || []),
        ].length > 0

      return {
        ...prev,
        [category]: updatedCategory,
        cause: hasEnvironmentalFactors
          ? Array.from(new Set([...prev.cause, "環境・物理的要因"]))
          : prev.cause.filter((c) => c !== "環境・物理的要因"),
      }
    })
  }

  const renderCheckboxes = (
    category: "medicalEquipment" | "medication" | "system" | "cooperation" | "explanation",
    items: string[],
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-${item}`}
            checked={formData[category]?.includes(item) || false}
            onCheckedChange={(checked) => updateEnvironmentalFactors(category, item, checked as boolean)}
          />
          <Label htmlFor={`${category}-${item}`}>{item}</Label>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">医療機器</h3>
        {renderCheckboxes("medicalEquipment", ["誤作動", "操作ミス", "故障", "その他"])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">薬剤</h3>
        {renderCheckboxes("medication", [
          "薬剤容器の類似",
          "薬剤の色の類似",
          "薬品名の類似",
          "複数の規格が存在し混同",
          "配置や管理が悪かった",
          "その他",
        ])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">システム</h3>
        {renderCheckboxes("system", ["指示誤り", "指示伝票運用の問題", "その他"])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">連携</h3>
        {renderCheckboxes("cooperation", [
          "情報不足",
          "情報伝達不足",
          "看護師間の連携不足",
          "医師看護師間の連携不足",
          "他職種間の連携不足",
          "その他",
        ])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">説明</h3>
        {renderCheckboxes("explanation", ["患者への説明不足", "スタッフへの説明不足", "その他"])}
      </div>
    </div>
  )
}

const professions = [
  "　",
  "医師",
  "看護師",
  "看護補助",
  "介護福祉士",
  "薬剤師",
  "理学療法士",
  "作業療法士",
  "言語聴覚士",
  "診療放射線技師",
  "臨床検査技師",
  "臨床工学技士",
  "管理栄養士(栄養士)",
  "調理師(調理員)",
  "ソーシャルワーカー",
  "医療事務",
  "総務",
  "経理",
  "人事",
  "事務職",
  "その他",
]

type IncidentFormProps = {
  initialData: Incident
  onSubmit: (data: Incident) => Promise<void>
  onCancel: () => void
}

export default function IncidentForm({ initialData, onSubmit, onCancel }: IncidentFormProps) {
  const [formData, setFormData] = useState<Incident>(initialData)
  const [creatorUser, setCreatorUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const { data: session } = useSession()
  const isAdminOrManager = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"
  const [isLoading, setIsLoading] = useState(false)

  const canViewInvolvedPartyName = isAdminOrManager || session?.user?.id === formData.userId
  // ユーザー情報を取得する関数
  const fetchUserData = async (userId: string) => {
    if (!userId) return

    setIsLoadingUser(true)
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      const userData = await response.json()
      setCreatorUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  useEffect(() => {
    // 編集時（id が 0 より大きい場合）にユーザー情報を取得
    if (initialData.id > 0 && initialData.userId) {
      fetchUserData(initialData.userId)
    }
  }, [initialData.id, initialData.userId])

  useEffect(() => {
    // 新規作成時（id が 0 または undefined の場合）にユーザー情報を設定
    if ((!initialData.id || initialData.id === 0) && session?.user) {
      setFormData((prev) => ({
        ...prev,
        userId: session.user.id || "",
        // 当事者情報を現在のユーザーで初期化（オプション）
        involvedPartyName: session.user.name || "",
        involvedPartyProfession: prev.involvedPartyProfession || "",
        // 発見者情報も同様に初期化（オプション）
        discovererName: session.user.name || "",
        discovererProfession: prev.discovererProfession || "",
      }))
    }
  }, [initialData.id, session])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    fieldName?: string,
  ) => {
    if (typeof e === "string" && fieldName) {
      setFormData((prev) => ({ ...prev, [fieldName]: e }))
    } else if (typeof e !== "string") {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCauseChange = (cause: string, checked: boolean) => {
    setFormData((prev) => {
      const updatedCause = checked ? Array.from(new Set([...prev.cause, cause])) : prev.cause.filter((c) => c !== cause)

      let updatedFormData = { ...prev, cause: updatedCause }
      if (!checked) {
        if (cause === "人的要因") {
          updatedFormData = {
            ...updatedFormData,
            involvedPartyFactors: [],
            workBehavior: [],
            physicalCondition: [],
            psychologicalState: [],
          }
        } else if (cause === "環境・物理的要因") {
          updatedFormData = {
            ...updatedFormData,
            medicalEquipment: [],
            medication: [],
            system: [],
            cooperation: [],
            explanation: [],
          }
        }
      }

      return updatedFormData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReportTime = () => {
    setFormData((prev) => ({ ...prev, reportToDoctor: prev.reportToSupervisor }))
  }

  const getLabelBackgroundColor = (field: string) => {
    if (field === "category") return "bg-yellow-200"
    if (field === "lifeThreat") return "bg-yellow-200"
    if (field === "trustImpact") return "bg-yellow-200"
    if (field === "impactLevel") return "bg-yellow-200"
    if (field === "workStatus") return "bg-yellow-200"
    return ""
  }

  const impactLevelExplanations = {
    レベル0: "誤った行為が発生したが、患者に実施されなかった場合（仮に実施されたとすれば、何らかの被害が予想された）。",
    レベル1: "誤った行為を患者に実施したが、結果として患者に影響を及ぼすに至らなかった場合。",
    レベル2: "誤った医療または管理により、患者に影響を与えた、または何らかの影響を与えた可能性がある場合。",
    レベル3a: "行なった医療または管理により、本来必要でなかった簡単な治療や処置が必要になった場合。",
    レベル3b: "誤った医療または管理により、本来必要でなかった治療や処置が必要になった場合。",
    レベル4: "行なった医療または管理により、生活に影響する重大な永続的障害が発生した可能性がある場合。",
    レベル5: "行なった医療または管理が死因となった場合。",
  }
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  
  // 作成者名を表示するための関数
  const getCreatorName = () => {
    if (formData.id > 0) {
      if (isLoadingUser) return "読み込み中..."
      return creatorUser?.name || "不明"
    }
    return session?.user?.name || "不明"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
         <div>
            <h3 className="font-semibold text-lg">レポート情報</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              作成者: {getCreatorName()}
              {creatorUser?.staffNumber && ` (職員番号: ${creatorUser.staffNumber})`}
            </p>
            {formData.id > 0 && session?.user?.id !== formData.userId && (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                (現在: {session?.user?.name || "不明"} として編集中)
              </p>
            )}
          </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientId">患者名 (必須)</Label>
          <Input
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleInputChange}
            className="dark:border-gray-700"
          />
        </div>
        <div>
          <Label htmlFor="patientGender">患者の性別</Label>
          <Select
            name="patientGender"
            value={formData.patientGender}
            onValueChange={(value) => handleInputChange(value, "patientGender")}
          >
            <SelectTrigger id="patientGender" className="dark:border-gray-700">
              <SelectValue placeholder="性別を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="男性">男性</SelectItem>
              <SelectItem value="女性">女性</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="patientAge">患者の年齢</Label>
          <Input
            id="patientAge"
            name="patientAge"
            type="number"
            value={formData.patientAge}
            onChange={handleInputChange}
            className="dark:border-gray-700"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientRespirator">人工呼吸器の有無</Label>
          <Select
            name="patientRespirator"
            value={formData.patientRespirator}
            onValueChange={(value) => handleInputChange(value, "patientRespirator")}
          >
            <SelectTrigger id="patientRespirator" className="dark:border-gray-700">
              <SelectValue placeholder="人工呼吸器の有無を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="呼吸器あり">有</SelectItem>
              <SelectItem value="呼吸器なし">無</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="patientDialysis">透析の有無</Label>
          <Select
            name="patientDialysis"
            value={formData.patientDialysis}
            onValueChange={(value) => handleInputChange(value, "patientDialysis")}
          >
            <SelectTrigger id="patientDialysis" className="dark:border-gray-700">
              <SelectValue placeholder="透析の有無を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="透析あり">有</SelectItem>
              <SelectItem value="透析なし">無</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        <div>
          <Label htmlFor="discovererName">発見者の氏名</Label>
          <Input
            id="discovererName"
            name="discovererName"
            value={formData.discovererName || ""}
            onChange={handleInputChange}
            className="dark:border-gray-700"
          />
        </div>
        <div>
          <Label htmlFor="discovererProfession">発見者の職種</Label>
          <Select
            name="discovererProfession"
            value={formData.discovererProfession}
            onValueChange={(value) => handleInputChange(value, "discovererProfession")}
          >
            <SelectTrigger id="discovererProfession" className="dark:border-gray-700">
              <SelectValue placeholder="職種を選択" />
            </SelectTrigger>
            <SelectContent className="dark:border-gray-700">
              {professions.map((profession) => (
                <SelectItem key={profession} value={profession}>
                  {profession}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        {canViewInvolvedPartyName && (
          <div>
            <Label htmlFor="involvedPartyName">当事者の氏名</Label>
            <Input
              id="involvedPartyName"
              name="involvedPartyName"
              value={formData.involvedPartyName || ""}
              onChange={handleInputChange}
              className="dark:border-gray-700"
            />
          </div>
        )}
        <div>
          <Label htmlFor="involvedPartyProfession" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            当事者の職種
          </Label>
          <Select
            name="involvedPartyProfession"
            value={formData.involvedPartyProfession}
            onValueChange={(value) => handleInputChange(value, "involvedPartyProfession")}
          >
            <SelectTrigger id="involvedPartyProfession" className="dark:border-gray-700">
              <SelectValue placeholder="職種を選択" />
            </SelectTrigger>
            <SelectContent>
              {professions.map((profession) => (
                <SelectItem key={profession} value={profession}>
                  {profession}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="involvedPartyExperience">当事者の経験年数</Label>
          <Input
            id="involvedPartyExperience"
            name="involvedPartyExperience"
            type="number"
            value={formData.involvedPartyExperience}
            onChange={handleInputChange}
            className="dark:border-gray-700"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="occurrenceDateTime">発生日時</Label>
        <Input
          type="datetime-local"
          id="occurrenceDateTime"
          name="occurrenceDateTime"
          value={
            formData.occurrenceDateTime
              ? format(parseISO(formData.occurrenceDateTime), "yyyy-MM-dd'T'HH:mm", { locale: ja })
              : ""
          }
          onChange={handleInputChange}
          className="dark:border-gray-700"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md dark:bg-gray-800 dark:text-white">
        <div>
          <Label htmlFor="department">発生元の部署</Label>
          <Select
            name="department"
            value={formData.department}
            onValueChange={(value) => handleInputChange(value, "department")}
            required
          >
            <SelectTrigger id="department" className="dark:border-gray-700">
              <SelectValue placeholder="部署を選択" />
            </SelectTrigger>
            <SelectContent>
              {[
                "1病棟",
                "3病棟",
                "5病棟",
                "6病棟",
                "7病棟",
                "医局",
                "外来",
                "薬剤科",
                "リハビリ科",
                "検査科",
                "放射線科",
                "臨床工学科",
                "栄養科",
                "医事課",
                "経理課",
                "人事課",
                "総務課",
                "その他",
              ].map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">発生場所</Label>
          <Select
            name="location"
            value={formData.location}
            onValueChange={(value) => handleInputChange(value, "location")}
            required
          >
            <SelectTrigger id="location" className="dark:border-gray-700">
              <SelectValue placeholder="発生場所を選択" />
            </SelectTrigger>
            <SelectContent>
              {[
                "病室",
                "ナースステーション",
                "廊下",
                "トイレ",
                "浴室",
                "配膳室",
                "厨房",
                "食堂",
                "検査室",
                "調剤室",
                "透析室",
                "リハビリ室",
                "事務所",
                "診察室",
                "処置室",
                "その他",
              ].map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="reportToSupervisor">所属長への報告日時</Label>
        <Input
          type="datetime-local"
          id="reportToSupervisor"
          name="reportToSupervisor"
          value={
            formData.reportToSupervisor
              ? format(parseISO(formData.reportToSupervisor), "yyyy-MM-dd'T'HH:mm", { locale: ja })
              : ""
          }
          onChange={handleInputChange}
          className="dark:border-gray-700"
          required
        />
      </div>

      <div>
        <Label htmlFor="reportToDoctor">
          医師への報告日時
          <Button type="button" onClick={copyReportTime} className="text-blue-500 text-xs bg-gray-100">
            所属長への報告日時と同じ
          </Button>
        </Label>
        <Input
          type="datetime-local"
          id="reportToDoctor"
          name="reportToDoctor"
          value={
            formData.reportToDoctor
              ? format(parseISO(formData.reportToDoctor), "yyyy-MM-dd'T'HH:mm", { locale: ja })
              : ""
          }
          onChange={handleInputChange}
          className="dark:border-gray-700"
          required
        />
      </div>

      <div className="bg-blue-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        <Label className="block mb-2">インシデントのカテゴリー</Label>
        <RadioGroup
          name="category"
          value={formData.category}
          onValueChange={(value) => handleInputChange(value, "category")}
          className="flex flex-wrap gap-4"
          required
        >
          {["薬物", "検査", "処置", "チューブ類", "転倒転落", "栄養", "接遇", "その他"].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <RadioGroupItem value={category} id={`category-${category}`} className="text-red-500" />
              <Label
                htmlFor={`category-${category}`}
                className={`${formData.category === category ? getLabelBackgroundColor("category") : ""} px-1 py-1 rounded`}
              >
                {category}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {formData.category === "薬物" && (
        <div className="bg-blue-50 p-4 rounded-md dark:bg-gray-700 dark:text-white">
          <Label htmlFor="medicationDetail" className="block mb-2">
            薬物詳細カテゴリー
          </Label>
          <Select
            name="medicationDetail"
            value={formData.medicationDetail}
            onValueChange={(value) => handleInputChange(value, "medicationDetail")}
          >
            <SelectTrigger id="medicationDetail" className="dark:border-gray-600">
              <SelectValue placeholder="詳細カテゴリーを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="点滴">点滴</SelectItem>
              <SelectItem value="内服">内服薬</SelectItem>
              <SelectItem value="皮下注">皮下注</SelectItem>
              <SelectItem value="皮内注">皮内注</SelectItem>
              <SelectItem value="静注">静注</SelectItem>
              <SelectItem value="筋注">筋注</SelectItem>
              <SelectItem value="外用薬">外用薬</SelectItem>
              <SelectItem value="麻薬">麻薬</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.category === "チューブ類" && (
        <div className="bg-blue-50 p-4 rounded-md dark:bg-gray-700 dark:text-white">
          <Label htmlFor="tubeDetail" className="block mb-2">
            チューブ類詳細カテゴリー
          </Label>
          <Select
            name="tubeDetail"
            value={formData.tubeDetail}
            onValueChange={(value) => handleInputChange(value, "tubeDetail")}
          >
            <SelectTrigger id="tubeDetail" className="dark:border-gray-600">
              <SelectValue placeholder="詳細カテゴリーを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="胃瘻カテ">胃瘻カテ</SelectItem>
              <SelectItem value="NGカテ">NGカテ</SelectItem>
              <SelectItem value="CVカテ">CVカテ</SelectItem>
              <SelectItem value="尿カテ">尿カテ</SelectItem>
              <SelectItem value="ドレーン類">ドレーン類</SelectItem>
              <SelectItem value="カニューレ">カニューレ</SelectItem>
              <SelectItem value="点滴">点滴</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
     
      <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        <Label className="block mb-2">生命への危険度</Label>
        <RadioGroup
          name="lifeThreat"
          value={formData.lifeThreat}
          onValueChange={(value) => handleInputChange(value, "lifeThreat")}
          className="flex flex-wrap gap-4"
          required
        >
          {["ない", "低い", "可能性あり", "高い", "きわめて高い", "死亡"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`lifeThreat-${level}`} />
              <Label
                htmlFor={`lifeThreat-${level}`}
                className={`${formData.lifeThreat === level ? getLabelBackgroundColor("lifeThreat") : ""} px-1 py-1 rounded`}
              >
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        <Label className="block mb-2">患者・家族の信頼度</Label>
        <RadioGroup
          name="trustImpact"
          value={formData.trustImpact}
          onValueChange={(value) => handleInputChange(value, "trustImpact")}
          className="flex flex-wrap gap-4"
          required
        >
          {["損なわない", "あまり損なわない", "少し損なう", "大きく損なう"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`trustImpact-${level}`} />
              <Label
                htmlFor={`trustImpact-${level}`}
                className={`${formData.trustImpact === level ? getLabelBackgroundColor("trustImpact") : ""} px-1 py-1 rounded`}
              >
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="bg-pink-100 p-4 rounded-md dark:bg-gray-800 dark:text-white">
        <Label className="block mb-2 flex items-center">
          影響レベル
          <TooltipProvider>
            <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
              <TooltipTrigger asChild>
                <span
                  className="ml-2 cursor-pointer"
                  onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                  onMouseEnter={() => setIsTooltipOpen(true)}
                  onMouseLeave={() => setIsTooltipOpen(false)}
                >
                  <Info className="h-4 w-4 text-gray-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <ul className="list-disc pl-4 space-y-2">
                  {Object.entries(impactLevelExplanations).map(([level, explanation]) => (
                    <li key={level}>
                      <strong>{level}:</strong> {explanation}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm italic">
                  ※レベル3b、4、5のアクシデントの場合は事故報告書の提出もお願いします。
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <RadioGroup
          name="impactLevel"
          value={formData.impactLevel}
          onValueChange={(value) => handleInputChange(value, "impactLevel")}
          className="flex flex-wrap gap-4"
          required
        >
          {["レベル1", "レベル2", "レベル3a", "レベル3b", "レベル4", "レベル5"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`impactLevel-${level}`} className="text-red-500" />
              <Label
                htmlFor={`impactLevel-${level}`}
                className={`${formData.impactLevel === level ? getLabelBackgroundColor("impactLevel") : ""} px-1 py-1 rounded`}
              >
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="p-4 rounded-md">
        <Label className="block mb-2">勤務状況</Label>
        <RadioGroup
          name="workStatus"
          value={formData.workStatus}
          onValueChange={(value) => handleInputChange(value, "workStatus")}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {[
            "余裕",
            "やや余裕",
            "普通",
            "多忙",
            "非常に多忙",
            "勤務体制に問題",
            "役割分担に問題",
            "当直明けだった",
            "当直だった",
            "その他",
          ].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <RadioGroupItem value={status} id={`workStatus-${status}`} />
              <Label
                htmlFor={`workStatus-${status}`}
                className={`${formData.workStatus === status ? getLabelBackgroundColor("workStatus") : ""} px-1 py-1 rounded`}
              >
                {status}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <br></br>
      <hr className="border-0 h-2 bg-transparent wavy-line" />
      <br></br>

      <div className="rounded-md">
        <Label className="block mb-2">発生の原因（タブ切替えで複数選択可能）</Label>
        <div className="flex flex-wrap gap-4">
          {["人的要因", "環境・物理的要因"].map((cause) => (
            <div key={cause} className="flex items-center space-x-2 dark:bg-gray-800 dark:text-white">
              <Checkbox
                id={`cause-${cause}`}
                checked={formData.cause.includes(cause)}
                onCheckedChange={(checked) => handleCauseChange(cause, checked as boolean)}
              />
              <Label htmlFor={`cause-${cause}`}>{cause}</Label>
            </div>
          ))}
        </div>
      </div>
      <Tabs defaultValue="human" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="human">人的要因</TabsTrigger>
          <TabsTrigger value="environmental">環境・物理的要因</TabsTrigger>
        </TabsList>
        <TabsContent value="human" className="bg-gray-50 p-4 rounded-md dark:bg-gray-800 dark:text-white">
          <HumanFactorsCheckboxes formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent value="environmental" className="bg-gray-50 p-4 rounded-md dark:bg-gray-800 dark:text-white">
          <EnvironmentalFactorsCheckboxes formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>
      <div>
        <Label htmlFor="details">詳細</Label>
        <Textarea
          id="details"
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          className="dark:border-gray-700"
        />
      </div>
      <div>
        <Label htmlFor="countermeasures">対策</Label>
        <Textarea
          id="countermeasures"
          name="countermeasures"
          value={formData.countermeasures || ""}
          onChange={handleInputChange}
          className="dark:border-gray-700"
        />
      </div>

      {!isAdminOrManager && (
        <div>
          <Label htmlFor="comment">所属長のコメント</Label>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment || ""}
            onChange={handleInputChange}
            disabled={true} // ここで無効化
            className="dark:border-gray-700"
          />
        </div>
      )}

      {isAdminOrManager && (
        <div>
          <Label htmlFor="comment">所属長のコメント</Label>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment || ""}
            onChange={handleInputChange}
            className="dark:border-gray-700"
          />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          {canViewInvolvedPartyName && (
            <Button type="submit" className="bg-blue-500 dark:bg-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

