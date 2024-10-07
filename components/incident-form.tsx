'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
}

type FactorsCheckboxesProps = {
  formData: Incident
  setFormData: React.Dispatch<React.SetStateAction<Incident>>
}

const HumanFactorsCheckboxes: React.FC<FactorsCheckboxesProps> = ({ formData, setFormData }) => {
  const updateHumanFactors = (category: 'involvedPartyFactors' | 'workBehavior' | 'physicalCondition' | 'psychologicalState', item: string, checked: boolean) => {
    setFormData(prev => {
      const updatedCategory = checked
        ? [...(prev[category] ?? []), item]
        : (prev[category] ?? []).filter(i => i !== item)
      
      const hasHumanFactors = [
        ...(updatedCategory ?? []), // 修正: null の場合は空配列を使用
        ...(prev.involvedPartyFactors ?? []),
        ...(prev.workBehavior ?? []),
        ...(prev.physicalCondition ?? []),
        ...(prev.psychologicalState ?? [])
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
            checked={formData[category]?.includes(item) ?? false} // nullチェックを追加
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
  '医師',
  '看護師',
  '看護補助',
  '介護士',
  '薬剤師',
  '理学療法士',
  '作業療法士',
  '言語聴覚士',
  '診療放射線技師',
  '臨床検査技師',
  '臨床工学技士',
  '管理栄養士',
  '医療事務',
  '事務員',
]

type IncidentFormProps = {
    initialData: Incident
    onSubmit: (data: Incident) => Promise<void>
    onCancel: () => void
  }

  export default function IncidentForm({ initialData, onSubmit, onCancel }: IncidentFormProps) {
    const [formData, setFormData] = useState<Incident>(initialData)

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
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientGender">患者の性別</Label>
          <Select
            name="patientGender"
            value={formData.patientGender}
            onValueChange={(value) => handleInputChange(value, 'patientGender')}
          >
            <SelectTrigger id="patientGender">
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
          />
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
            <SelectTrigger id="patientRespirator">
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
            <SelectTrigger id="patientDialysis">
              <SelectValue placeholder="透析の有無を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="透析あり">有</SelectItem>
              <SelectItem value="透析なし">無</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="involvedPartyProfession">当事者の職種</Label>
          <Select
            name="involvedPartyProfession"
            value={formData.involvedPartyProfession}
            onValueChange={(value) => handleInputChange(value, 'involvedPartyProfession')}
          >
            <SelectTrigger id="involvedPartyProfession">
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
          />
        </div>
      </div>
      <div>
        <Label htmlFor="discovererProfession">発見者の職種</Label>
        <Select
          name="discovererProfession"
          value={formData.discovererProfession}
          onValueChange={(value) => handleInputChange(value, 'discovererProfession')}
        >
          <SelectTrigger id="discovererProfession">
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
        <Label htmlFor="occurrenceDateTime">発生日時</Label>
        <Input
          type="datetime-local"
          id="occurrenceDateTime"
          name="occurrenceDateTime"
          value={formData.occurrenceDateTime}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor="location">発生場所</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor="reportToDoctor">医師への報告日時</Label>
        <Input
          type="datetime-local"
          id="reportToDoctor"
          name="reportToDoctor"
          value={formData.reportToDoctor}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor="reportToSupervisor">所属長への報告日時</Label>
        <Input
          type="datetime-local"
          id="reportToSupervisor"
          name="reportToSupervisor"
          value={formData.reportToSupervisor}
          onChange={handleInputChange}
        />
      </div>
      <div className='bg-blue-100 p-4 rounded-md'>
        <Label className="block mb-2 ">インシデトのカテゴリー</Label>
        <RadioGroup
          name="category"
          value={formData.category}
          onValueChange={(value) => handleInputChange(value, 'category')}
          className="flex flex-wrap gap-4"
          required
        >
          {['薬物', '検査', 'チュー類抜去', '転倒転落', '栄養', '接遇', 'その他'].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <RadioGroupItem value={category} id={`category-${category}`} />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className='bg-gray-100 p-4 rounded-md'>
        <Label className="block mb-2">生命への危険度</Label>
        <RadioGroup
          name="lifeThreat"
          value={formData.lifeThreat}
          onValueChange={(value) => handleInputChange(value, 'lifeThreat')}
          className="flex flex-wrap gap-4"
          required
        >
          {['ない', '低い', '可能性あり', '高い', 'きわめて高い', '死亡'].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`lifeThreat-${level}`} />
              <Label htmlFor={`lifeThreat-${level}`}>{level}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className='bg-gray-100 p-4 rounded-md'>
        <Label className="block mb-2">患者・家族の信頼度</Label>
        <RadioGroup
          name="trustImpact"
          value={formData.trustImpact}
          onValueChange={(value) => handleInputChange(value, 'trustImpact')}
          className="flex flex-wrap gap-4"
          required
        >
          {['損なわない', 'あまり損なわない', '少し損なう', '大きく損なう'].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`trustImpact-${level}`} />
              <Label htmlFor={`trustImpact-${level}`}>{level}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className='bg-pink-100 p-4 rounded-md'>
        <Label className="block mb-2">影響レベル</Label>
        <RadioGroup
          name="impactLevel"
          value={formData.impactLevel}
          onValueChange={(value) => handleInputChange(value, 'impactLevel')}
          className="flex flex-wrap gap-4"
          required
        >
          {['レベル1', 'レベル2', 'レベル3a', 'レベル3b', 'レベル4', 'レベル5'].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`impactLevel-${level}`} />
              <Label htmlFor={`impactLevel-${level}`}>{level}</Label>
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
              <RadioGroupItem value={status} id={`workStatus-${status}`} />
              <Label htmlFor={`workStatus-${status}`}>{status}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <br></br>
      <hr className="border-0 h-2 bg-transparent wavy-line" />
      <br></br>

      <div className='rounded-md'>
        <Label className="block mb-2">発生の原���（複数選択���）</Label>
        <div className="flex flex-wrap gap-4">
          {['人的要因', '環境・物理的要因'].map((cause) => (
            <div key={cause} className="flex items-center space-x-2">
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
        <TabsContent value="human" className="bg-gray-50 p-4 rounded-md">
          <HumanFactorsCheckboxes formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent value="environmental" className="bg-gray-50 p-4 rounded-md">
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
        />
      </div>
      <div>
        <Label htmlFor="countermeasures">対策</Label>
        <Textarea
          id="countermeasures"
          name="countermeasures"
          value={formData.countermeasures || ''}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  )
}