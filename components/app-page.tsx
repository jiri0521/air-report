'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

export function Page() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [formData, setFormData] = useState<Incident>({
    id: 0,
    patientGender: '',
    patientAge: '',
    patientRespirator: '',
    patientDialysis: '',
    involvedPartyProfession: '',
    involvedPartyExperience: '',
    discovererProfession: '',
    occurrenceDateTime: '',
    location: '',
    reportToDoctor: '',
    reportToSupervisor: '',
    category: '',
    lifeThreat: '',
    trustImpact: '',
    impactLevel: '',
    cause: '',
    details: '',
    summary: ''
  })

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
    if (error) {
      console.error('Error fetching incidents:', error)
    } else {
      setIncidents(data)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, fieldName?: string) => {
    if (typeof e === 'string' && fieldName) {
      setFormData(prev => ({ ...prev, [fieldName]: e }))
    } else if (typeof e !== 'string') {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('incidents')
      .insert([formData])
      .select()
    if (error) {
      console.error('Error inserting incident:', error)
    } else {
      setIncidents(prev => [...prev, ...data])
      setFormData({
        id: 0,
        patientGender: '',
        patientAge: '',
        patientRespirator: '',
        patientDialysis: '',
        involvedPartyProfession: '',
        involvedPartyExperience: '',
        discovererProfession: '',
        occurrenceDateTime: '',
        location: '',
        reportToDoctor: '',
        reportToSupervisor: '',
        category: '',
        lifeThreat: '',
        trustImpact: '',
        impactLevel: '',
        cause: '',
        details: '',
        summary: ''
      })
    }
  }

  const getIncidentCountByCategory = () => {
    return incidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getIncidentCountByImpactLevel = () => {
    return incidents.reduce((acc, incident) => {
      acc[incident.impactLevel] = (acc[incident.impactLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const generateSummary = () => {
    const words = formData.details.split(' ')
    const summary = words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '')
    setFormData(prev => ({ ...prev, summary }))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">医療安全インシデントレポート</h1>
      
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
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
                <SelectItem value="other">その他</SelectItem>
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
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientRespirator">呼吸器の有無</Label>
            <Select
              name="patientRespirator"
              value={formData.patientRespirator}
              onValueChange={(value) => handleInputChange(value, 'patientRespirator')}
            >
              <SelectTrigger id="patientRespirator">
                <SelectValue placeholder="呼吸器の有無を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">有</SelectItem>
                <SelectItem value="no">無</SelectItem>
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
                <SelectItem value="yes">有</SelectItem>
                <SelectItem value="no">無</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="involvedPartyProfession">当事者の職種</Label>
            <Input
              id="involvedPartyProfession"
              name="involvedPartyProfession"
              value={formData.involvedPartyProfession}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="involvedPartyExperience">当事者の経験年数</Label>
            <Input
              id="involvedPartyExperience"
              name="involvedPartyExperience"
              type="number"
              value={formData.involvedPartyExperience}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="discovererProfession">発見者の職種</Label>
          <Input
            id="discovererProfession"
            name="discovererProfession"
            value={formData.discovererProfession}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="occurrenceDateTime">発生日時</Label>
          <Input
            type="datetime-local"
            id="occurrenceDateTime"
            name="occurrenceDateTime"
            value={formData.occurrenceDateTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">発生場所</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
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
            required
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
            required
          />
        </div>
        <div>
          <Label className="block mb-2">インシデントのカテゴリー</Label>
          <RadioGroup
            name="category"
            value={formData.category}
            onValueChange={(value) => handleInputChange(value, 'category')}
            className="flex flex-wrap gap-4"
            required
          >
            {['薬物', '検査', 'チューブ類抜去', '転倒転落', '栄養', '接遇', 'その他'].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`category-${category}`} />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div>
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
        <div>
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
        <div>
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
        <div>
          <Label className="block mb-2">発生の原因</Label>
          <RadioGroup
            name="cause"
            value={formData.cause}
            onValueChange={(value) => handleInputChange(value, 'cause')}
            className="flex flex-wrap gap-4"
            required
          >
            {['人的要因', '環境・物理的要因'].map((cause) => (
              <div key={cause} className="flex items-center space-x-2">
                <RadioGroupItem value={cause} id={`cause-${cause}`} />
                <Label htmlFor={`cause-${cause}`}>{cause}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="details">詳細</Label>
          <Textarea
            id="details"
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" onClick={generateSummary}>要約生成</Button>
          {formData.summary && (
            <div className="flex-1 p-2 bg-gray-100 rounded">
              <strong>要約:</strong> {formData.summary}
            </div>
          )}
        </div>
        <Button type="submit">レポート提出</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>インシデント一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {incidents.map(incident => (
                <li key={incident.id} className="border-b pb-4">
                  <p><strong>患者の性別:</strong> {incident.patientGender}</p>
                  <p><strong>患者の年齢:</strong> {incident.patientAge}</p>
                  <p><strong>呼吸器の有無:</strong> {incident.patientRespirator}</p>
                  <p><strong>透析の有無:</strong> {incident.patientDialysis}</p>
                  <p><strong>当事者の職種:</strong> {incident.involvedPartyProfession}</p>
                  <p><strong>当事者の経験年数:</strong> {incident.involvedPartyExperience}</p>
                  <p><strong>発見者の職種:</strong> {incident.discovererProfession}</p>
                  <p><strong>発生日時:</strong> {incident.occurrenceDateTime}</p>
                  <p><strong>発生場所:</strong> {incident.location}</p>
                  <p><strong>医師への報告日時:</strong> {incident.reportToDoctor}</p>
                  <p><strong>所属長への報告日時:</strong> {incident.reportToSupervisor}</p>
                  <p><strong>カテゴリー:</strong> {incident.category}</p>
                  <p><strong>生命への危険度:</strong> {incident.lifeThreat}</p>
                  <p><strong>患者・家族の信頼度:</strong> {incident.trustImpact}</p>
                  <p><strong>影響レベル:</strong> {incident.impactLevel}</p>
                  <p><strong>発生の原因:</strong> {incident.cause}</p>
                  <p><strong>詳細:</strong> {incident.details}</p>
                  <p><strong>要約:</strong> {incident.summary}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別集計</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(getIncidentCountByCategory()).map(([category, count]) => (
                  <li key={category}>
                    {category}: {count}件
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>影響レベル別集計</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(getIncidentCountByImpactLevel()).map(([level, count]) => (
                  <li key={level}>
                    {level}: {count}件
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}