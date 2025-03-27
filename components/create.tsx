'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import party from "party-js";
import { Card } from './ui/card';
import { Loader2, ArrowUp, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation';






type Incident = {
  patientId: string
  patientGender: string
  patientAge: string
  department: string
  patientRespirator: string
  patientDialysis: string
  involvedPartyProfession: string
  involvedPartyExperience: string
  involvedPartyName: string // New field
  discovererProfession: string
  discovererName: string // New field
  occurrenceDateTime: string
  location: string
  reportToDoctor: string
  reportToSupervisor: string
  category: string
  medicationDetail: string // New field for detailed medication category
  tubeDetail: string // New field for detailed tube category
  lifeThreat: string
  trustImpact: string
  impactLevel: string
  cause: string[]
  details: string
  summary: string
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
  comment: string // ここに追加
  userId:string
}

type FactorsCheckboxesProps = {
  formData: Incident
  setFormData: React.Dispatch<React.SetStateAction<Incident>>
}

const HumanFactorsCheckboxes: React.FC<FactorsCheckboxesProps> = ({ formData, setFormData }) => {
  const updateHumanFactors = (category: 'involvedPartyFactors' | 'workBehavior' | 'physicalCondition' | 'psychologicalState', item: string, checked: boolean) => {
    setFormData(prev => {
      const updatedCategory = checked
        ? [...prev[category], item]
        : prev[category].filter(i => i !== item)
      
      const hasHumanFactors = [
        ...updatedCategory,
        ...prev.involvedPartyFactors,
        ...prev.workBehavior,
        ...prev.physicalCondition,
        ...prev.psychologicalState
      ].length > 0

      return {
        ...prev,
        [category]: updatedCategory,
        cause: hasHumanFactors
          ? Array.from(new Set([...prev.cause, '人的要因']))
          : prev.cause.filter(c => c !== '人的要因')
      }
    })
  }

  const renderCheckboxes = (category: 'involvedPartyFactors' | 'workBehavior' | 'physicalCondition' | 'psychologicalState', items: string[]) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map(item => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-${item}`}
            checked={formData[category].includes(item)}
            onCheckedChange={(checked) => updateHumanFactors(category, item, checked as boolean)}
          />
          <Label htmlFor={`${category}-${item}`} className="text-sm">{item}</Label>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">当事者の要因</h3>
        {renderCheckboxes('involvedPartyFactors', ['判断誤り', '確認不足', '観察不足', '知識不足', '知識誤り', '認識不足', '経験不足', '技術未熟', '技術誤り', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">作業行動</h3>
        {renderCheckboxes('workBehavior', ['手順を守らなかった', 'やりにくかった', '作業の中断があった', '同時に複数の作業をした', '初めての作業だった', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">身体的状態</h3>
        {renderCheckboxes('physicalCondition', ['寝不足', '体調不良', '眠くなる薬を飲んでいた', '怪我をしていた', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">心理的状態</h3>
        {renderCheckboxes('psychologicalState', ['慌てていた', '思い込み', '面倒だった', '変だと気づいていたが言えなかった', 'イライラ', '緊張', '無意識', '他のことに気を取られていた', '大丈夫だと思った', 'その他'])}
      </div>
    </div>
  )
}

const EnvironmentalFactorsCheckboxes: React.FC<FactorsCheckboxesProps> = ({ formData, setFormData }) => {
  const updateEnvironmentalFactors = (category: 'medicalEquipment' | 'medication' | 'system' | 'cooperation' | 'explanation', item: string, checked: boolean) => {
    setFormData(prev => {
      const updatedCategory = checked
        ? [...prev[category], item]
        : prev[category].filter(i => i !== item)
      
      const hasEnvironmentalFactors = [
        ...updatedCategory,
        ...prev.medicalEquipment,
        ...prev.medication,
        ...prev.system,
        ...prev.cooperation,
        ...prev.explanation
      ].length > 0

      return {
        ...prev,
        [category]: updatedCategory,
        cause: hasEnvironmentalFactors
          ? Array.from(new Set([...prev.cause, '環境・物理的要因']))
          : prev.cause.filter(c => c !== '環境・物理的要因')
      }
    })
  }

  const renderCheckboxes = (category: 'medicalEquipment' | 'medication' | 'system' | 'cooperation' | 'explanation', items: string[]) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map(item => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-${item}`}
            checked={formData[category].includes(item)}
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
        {renderCheckboxes('medicalEquipment', ['誤作動', '操作ミス', '故障', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">薬剤</h3>
        {renderCheckboxes('medication', ['薬剤容器の類似', '薬剤の色の類似', '薬品名の類似', '複数の規格が存在し混同', '配置や管理が悪かった', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">システム</h3>
        {renderCheckboxes('system', ['指示誤り', '指示伝票運用の問題', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">連携</h3>
        {renderCheckboxes('cooperation', ['情報不足', '情報伝達不足', '看護師間の連携不足', '医師看護師間の連携不足', '他職種間の連携不足', 'その他'])}
      </div>
      <div>
        <h3 className="font-semibold mb-2">説明</h3>
        {renderCheckboxes('explanation', ['患者への説明不足', 'スタッフへの説明不足', 'その他'])}
      </div>
    </div>
  )
}
const professions = [
  '　',
  '医師',
  '看護師',
  '看護補助',
  '介護福祉士',
  '薬剤師',
  '理学療法士',
  '作業療法士',
  '言語聴覚士',
  '診療放射線技師',
  '臨床検査技師',
  '臨床工学技士',
  '管理栄養士(栄養士)',
  '調理師(調理員)',
  'ソーシャルワーカー',
  '医療事務',
  '総務',
  '経理',
  '人事',
  '事務職',
  'その他',
]

const impactLevelExplanations = {
  'レベル0': '誤った行為が発生したが、患者に実施されなかった場合（仮に実施されたとすれば、何らかの被害が予想された）。',
  'レベル1': '誤った行為を患者に実施したが、結果として患者に影響を及ぼすに至らなかった場合。',
  'レベル2': '誤った医療または管理により、患者に影響を与えた、または何らかの影響を与えた可能性がある場合。',
  'レベル3a': '行なった医療または管理により、本来必要でなかった簡単な治療や処置が必要になった場合。',
  'レベル3b': '誤った医療または管理により、本来必要でなかった治療や処置が必要になった場合。',
  'レベル4': '行なった医療または管理により、生活に影響する重大な永続的障害が発生した可能性がある場合。',
  'レベル5': '行なった医療または管理が死因となった場合。',
}


export default function Component() {
  const [formData, setFormData] = useState<Incident>({
    patientId: '',
    patientGender: '',
    patientAge: '',
    department: '',
    patientRespirator: '',
    patientDialysis: '',
    involvedPartyProfession: '',
    involvedPartyExperience: '',
    involvedPartyName: '', // New field
    discovererProfession: '',
    discovererName: '', // New field
    occurrenceDateTime: '',
    location: '',
    reportToDoctor: '',
    reportToSupervisor: '',
    category: '',
    medicationDetail: '',
    tubeDetail: '', // New field for detailed tube category
    lifeThreat: '',
    trustImpact: '',
    impactLevel: '',
    cause: [],
    details: '',
    summary: '',
    workStatus: '',
    involvedPartyFactors: [],
    workBehavior: [],
    physicalCondition: [],
    psychologicalState: [],
    medicalEquipment: [],
    medication: [],
    system: [],
    cooperation: [],
    explanation: [],
    comment: "",
    userId:""
  })
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCardLoading, setIsCardLoading] = useState(true)
  const { data: session } = useSession();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
 
  const router = useRouter()

 

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsCardLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, fieldName?: string) => {
    if (typeof e === 'string' && fieldName) {
      setFormData(prev => ({ ...prev, [fieldName]: e }))
    } else if (typeof e !== 'string') {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCauseChange = (cause: string, checked: boolean) => {
    setFormData(prev => {
      const updatedCause = checked
        ? Array.from(new Set([...prev.cause, cause]))
        : prev.cause.filter(c => c !== cause)

      // If unchecking a cause, clear related factors
      let updatedFormData = { ...prev, cause: updatedCause }
      if (!checked) {
        if (cause === '人的要因') {
          updatedFormData = {
            ...updatedFormData,
            involvedPartyFactors: [],
            workBehavior: [],
            physicalCondition: [],
            psychologicalState: []
          }
        } else if (cause === '環境・物理的要因') {
          updatedFormData = {
            ...updatedFormData,
            medicalEquipment: [],
            medication: [],
            system: [],
            cooperation: [],
            explanation: []
          }
        }
      }

      return updatedFormData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formattedData = {
      ...formData,
      occurrenceDateTime: formData.occurrenceDateTime ? new Date(formData.occurrenceDateTime).toISOString() : null,
      reportToDoctor: formData.reportToDoctor ? new Date(formData.reportToDoctor).toISOString() : null,
      reportToSupervisor: formData.reportToSupervisor ? new Date(formData.reportToSupervisor).toISOString() : null,
      cause: formData.cause.length > 0 ? formData.cause.join(', ') : '',
      involvedPartyFactors: formData.involvedPartyFactors.length > 0 ? formData.involvedPartyFactors : [],
      workBehavior: formData.workBehavior.length > 0 ? formData.workBehavior : [],
      physicalCondition: formData.physicalCondition.length > 0 ? formData.physicalCondition : [],
      psychologicalState: formData.psychologicalState.length > 0 ? formData.psychologicalState : [],
      medicalEquipment: formData.medicalEquipment.length > 0 ? formData.medicalEquipment : [],
      medication: formData.medication.length > 0 ? formData.medication : [],
      system: formData.system.length > 0 ? formData.system : [],
      cooperation: formData.cooperation.length > 0 ? formData.cooperation : [],
      explanation: formData.explanation.length > 0 ? formData.explanation : [],
      userId: session?.user.id || ''
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to submit incident: ${errorData.error}`)
      }

      setFormData({
        patientId:'',
        patientGender: '',
        patientAge: '',
        department: '',
        patientRespirator: '',
        patientDialysis: '',
        involvedPartyProfession: '',
        involvedPartyExperience: '',
        involvedPartyName:'',
        discovererProfession: '',
        discovererName:'',
        occurrenceDateTime: '',
        location: '',
        reportToDoctor: '',
        reportToSupervisor: '',
        category: '',
        medicationDetail: '',
        tubeDetail: '',
        lifeThreat: '',
        trustImpact: '',
        impactLevel: '',
        cause: [],
        details: '',
        summary: '',
        workStatus: '',
        involvedPartyFactors: [],
        workBehavior: [],
        physicalCondition: [],
        psychologicalState: [],
        medicalEquipment: [],
        medication: [],
        system: [],
        cooperation: [],
        explanation: [],
        comment:'',
        userId: ''
      })
      setIsSuccessModalOpen(true)
      setIsLoading(false)
      // Trigger confetti effect
      party.confetti(document.body, {
        count: party.variation.range(50, 200)
      })
    } catch (error) {
      console.error('Error inserting incident:', error)
    }
  }

  const copyReportTime = () => {
    setFormData(prev => ({ ...prev, reportToDoctor: prev.reportToSupervisor }))
  }

  const generateSummary = async () => {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
          method: 'POST',
          headers: {
              'Authorization': process.env.HUGINGFACE_KEY!,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              inputs: formData.details,
              parameters: {
                  max_length: 130,
                  min_length: 30,
                  do_sample: false,
              }
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${errorData.error}`);
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, summary: data[0].summary_text }));
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  }



  const CardSkeleton = () => (
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
  )
  const getLabelBackgroundColor = (field: string) => {
    if (field === 'category') return 'bg-yellow-200'
    if (field === 'lifeThreat') return 'bg-yellow-200'
    if (field === 'trustImpact') return 'bg-yellow-200'
    if (field === 'impactLevel') return 'bg-yellow-200'
    if (field === 'workStatus') return 'bg-yellow-200'
    return ''
  }

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
        入力フォームが正常に表示されない場合、<br></br>
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
    <div className="container mx-auto max-w-[768px] p-10">
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <p>職員番号: {session?.user?.staffNumber}</p>
        <p>{session?.user?.name}さんですか？</p>
        <p>
          違う場合は
          <Button onClick={handleReload} className="bg-gray-200 text-gray-800 ml-2">
            ログイン情報を再取得
          </Button>
        </p>
      </div>
      <h1 className="text-2xl font-bold mb-4">レポート作成</h1>
      {isCardLoading ? (
        <CardSkeleton />
      ) : (
        <Card className='shadow-xl'>
          <form onSubmit={handleSubmit} className="px-5 py-8 space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">患者名(必須)</Label>
                <Input
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="dark:border-gray-700"
                  required
                />
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

              <div>
          <Label htmlFor="patientGender">患者の性別</Label>
          <Select
            name="patientGender"
            value={formData.patientGender}
            onValueChange={(value) => handleInputChange(value, 'patientGender')}
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
              
            </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientRespirator">人工呼吸器の有無</Label>
            <Select
              name="patientRespirator"
              value={formData.patientRespirator}
              onValueChange={(value) => handleInputChange(value, 'patientRespirator')}
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
              onValueChange={(value) => handleInputChange(value, 'patientDialysis')}
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
                  value={formData.discovererName}
                  onChange={handleInputChange}
                  className="dark:border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="discovererProfession">発見者の職種</Label>
                <Select
                  name="discovererProfession"
                  value={formData.discovererProfession}
                  onValueChange={(value) => handleInputChange(value, 'discovererProfession')}
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
            <div>
                <Label htmlFor="involvedPartyName">当事者の氏名</Label>
                <Input
                  id="involvedPartyName"
                  name="involvedPartyName"
                  value={formData.involvedPartyName}
                  onChange={handleInputChange}
                  className="dark:border-gray-700"
                />
              </div>
           
              <div>
                <Label htmlFor="involvedPartyProfession">当事者の職種</Label>
                <Select
                  name="involvedPartyProfession"
                  value={formData.involvedPartyProfession}
                  onValueChange={(value) => handleInputChange(value, 'involvedPartyProfession')}
                >
                  <SelectTrigger id="involvedPartyProfession" className="dark:border-gray-700">
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
            value={formData.occurrenceDateTime}
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
                                onValueChange={(value) => handleInputChange(value, 'department')}
                                required
                              >
                                <SelectTrigger id="department" className="dark:border-gray-700">
                                  <SelectValue placeholder="部署を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['1病棟', '3病棟', '5病棟', '6病棟', '7病棟', '医局', '外来', '薬剤科', 'リハビリ科', '検査科', '放射線科', '臨床工学科', '栄養科', '医事課', '経理課', '人事課', '総務課', 'その他'].map((dept) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="location">発生場所</Label>
                              <Select
                                name="location"
                                value={formData.location}
                                onValueChange={(value) => handleInputChange(value, 'location')}
                                required
                              >
                                <SelectTrigger id="location" className="dark:border-gray-700">
                                  <SelectValue placeholder="発生場所を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['病室', 'ナースステーション', '廊下', 'トイレ', '浴室', '配膳室', '厨房', '食堂', '検査室', '調剤室', '透析室', 'リハビリ室', '事務所', '診察室', '処置室', 'その他'].map((location) => (
                                    <SelectItem key={location} value={location}>{location}</SelectItem>
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
            value={formData.reportToSupervisor}
            onChange={handleInputChange}
            className="dark:border-gray-700"
            required
          />
        </div>

        <div>
          <Label htmlFor="reportToDoctor">医師への報告日時 
            <Button type="button" onClick={copyReportTime} className="text-blue-500 text-xs bg-gray-100">
              所属長への報告日時と同じ
            </Button>
          </Label>
          <Input
            type="datetime-local"
            id="reportToDoctor"
            name="reportToDoctor"
            value={formData.reportToDoctor}
            onChange={handleInputChange}
            className="dark:border-gray-700"
            required
          />
             
        </div>



        <div className='bg-blue-100 p-4 rounded-md dark:bg-gray-800 dark:text-white'>
        <Label className="block mb-2">インシデントのカテゴリー</Label>
        <RadioGroup
          name="category"
          value={formData.category}
          onValueChange={(value) => handleInputChange(value, 'category')}
          className="flex flex-wrap gap-4"
          required
        >
          {['薬物', '検査', '処置', 'チューブ類', '転倒転落', '栄養', '接遇', 'その他'].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <RadioGroupItem value={category} id={`category-${category}`} className='text-red-500'/>
              <Label 
                htmlFor={`category-${category}`}
                className={`${formData.category === category ? getLabelBackgroundColor('category') : ''} px-1 py-1 rounded`}
              >
                {category}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {formData.category === '薬物' && (
        <div className='bg-blue-50 p-4 rounded-md dark:bg-gray-700 dark:text-white'>
          <Label htmlFor="medicationDetail" className="block mb-2">薬物詳細カテゴリー</Label>
          <Select
            name="medicationDetail"
            value={formData.medicationDetail}
            onValueChange={(value) => handleInputChange(value, 'medicationDetail')}
          >
            <SelectTrigger id="medicationDetail" className="dark:border-gray-600">
              <SelectValue placeholder="詳細カテゴリーを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="点滴">点滴</SelectItem>
              <SelectItem value="内服薬">内服薬</SelectItem>
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

      {formData.category === 'チューブ類' && (
        <div className='bg-blue-50 p-4 rounded-md dark:bg-gray-700 dark:text-white'>
          <Label htmlFor="tubeDetail" className="block mb-2">チューブ類詳細カテゴリー</Label>
          <Select
            name="tubeDetail"
            value={formData.tubeDetail}
            onValueChange={(value) => handleInputChange(value, 'tubeDetail')}
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
        <div className='bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white'>
          <Label className="block mb-2">生命への危険度</Label>
          <RadioGroup
            name="lifeThreat"
            value={formData.lifeThreat}
            onValueChange={(value) => handleInputChange(value, 'lifeThreat')}
            className="flex flex-wrap gap-4 dark:bg-gray-800 dark:text-white"
            required
          >
            {['ない', '低い', '可能性あり', '高い', 'きわめて高い', '死亡'].map((level) => (
              <div key={level} className="flex items-center space-x-2 ">
                <RadioGroupItem value={level} id={`lifeThreat-${level}`} className='text-red-500'/>
                <Label 
                      htmlFor={`lifeThreat-${level}`}
                      className={`${formData.lifeThreat === level ? getLabelBackgroundColor('lifeThreat') : ''} px-1 py-1 rounded`}
                    >
                      {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className='bg-gray-100 p-4 rounded-md dark:bg-gray-800 dark:text-white'>
          <Label className="block mb-2">患者・家族の信頼度</Label>
          <RadioGroup
            name="trustImpact"
            value={formData.trustImpact}
            onValueChange={(value) => handleInputChange(value, 'trustImpact')}
            className="flex flex-wrap gap-4 dark:bg-gray-800 dark:text-white"
            required
          >
            {['損なわない', 'あまり損なわない', '少し損なう', '大きく損なう'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`trustImpact-${level}`} className='text-red-500'/>
                <Label 
                      htmlFor={`trustImpact-${level}`}
                      className={`${formData.trustImpact === level ? getLabelBackgroundColor('trustImpact') : ''} px-1 py-1 rounded`}
                    >{level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className='bg-pink-100 p-4 rounded-md dark:bg-gray-800 dark:text-white'>
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
                <p className="mt-2 text-sm italic">※レベル3b、4、5のアクシデントの場合は事故報告書の提出もお願いします。</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
          <RadioGroup
            name="impactLevel"
            value={formData.impactLevel}
            onValueChange={(value) => handleInputChange(value, 'impactLevel')}
            className="flex flex-wrap gap-4"
            required
          >
            {['レベル1', 'レベル2', 'レベル3a', 'レベル3b', 'レベル4', 'レベル5'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`impactLevel-${level}`} className='text-red-500'/>
                <Label 
                  htmlFor={`impactLevel-${level}`}
                  className={`${formData.impactLevel === level ? getLabelBackgroundColor('impactLevel') : ''} px-1 py-1 rounded`}
                >
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className='p-4 rounded-md'>
          <Label className="block mb-2">勤務状況</Label>
          <RadioGroup
            name="workStatus"
            value={formData.workStatus}
            onValueChange={(value) => handleInputChange(value, 'workStatus')}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {['余裕', 'やや余裕', '普通', '多忙', '非常に多忙', '勤務体制に問題', '役割分担に問題', '当直明けだった', '当直だった', 'その他'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={`workStatus-${status}`} className='text-red-500'/>
                <Label 
                      htmlFor={`workStatus-${status}`}
                      className={`${formData.workStatus === status ? getLabelBackgroundColor('workStatus') : ''} px-1 py-1 rounded`}
                    >{status}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <br></br>
        <hr className="border-0 h-2 bg-transparent wavy-line" />
        <br></br>

        <div className='rounded-md'>
          <Label className="block mb-2">発生の原因（複数選択可）</Label>
          <div className="flex flex-wrap gap-4">
            {['人的要因', '環境・物理的要因'].map((cause) => (
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
          <TabsContent value="environmental" className="bg-gray-50 p-4 rounded-md ">
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
        <div className="hidden flex items-center space-x-2">
          <Button type="button" onClick={generateSummary}>要約生成</Button>
          {formData.summary && (
            <div className="flex-1 p-2 bg-gray-100 rounded">
              <strong>要約:</strong> {formData.summary}
            </div>
          )}
        </div>
        <Button type="submit" className='bg-blue-500 dark:bg-white' disabled={isLoading} >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            'レポート提出'
          )}
        </Button>
        </form>
        </Card>
      )}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent >
          <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-300">
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-xl font-bold text-blue-600">登録成功</DialogTitle>
              <DialogDescription className="text-gray-600">
                インシデントレポートが正常に登録されました。
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
      {showScrollTop && (
        <Button
          className="fixed bottom-4 right-20 rounded-full p-2 bg-yellow-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-opacity duration-300"
          onClick={scrollToTop}
          aria-label="ページ上部へ戻る"
        >上部へ戻る
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

