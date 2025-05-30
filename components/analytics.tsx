"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Download, TrendingUp } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import ja from 'date-fns/locale/ja'
import { Skeleton } from "@/components/ui/skeleton"


registerLocale('ja', ja)

interface AnalyticsData {
  totalIncidents: { current: number; previous: number }
  severeIncidents: { current: number; previous: number }
  recurrenceRate: { current: number; previous: number }
  trendData: Array<{ name: string; incidents: number }>
  categoryData: Array<{ category: string; incidents: number }>
  severityData: Array<{ name: string; value: number }>
  crossAnalysisData: Record<string, Record<string, number>>
  timeOfDayData: Array<{ hour: string; incidents: number }>
  causeData: Array<{ cause: string; incidents: number }>
  medicationData: {
    totalMedicationIncidents: number
    medicationDetails: Array<{ detail: string; count: number }>
  }
  tubeData: {
    totalTubeIncidents: number
    tubeDetails: Array<{ detail: string; count: number }>
  }
  factorsData: Record<string, Array<{ name: string; count: number }>>
}

export function Analytics() {
  const [dateRange, setDateRange] = useState("lastyear")
  const [department, setDepartment] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    let url = `/api/analytics?department=${department}`

    if (dateRange === "custom" && startDate && endDate) {
      url += `&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
    } else {
      url += `&dateRange=${dateRange}`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const data: AnalyticsData = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      setError('データの取得中にエラーが発生しました。')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [dateRange, department, startDate, endDate])


  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number(((current - previous) / previous * 100).toFixed(2))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#000000']

  const handleExportCSV = () => {
    if (!analyticsData) return

    const { trendData, categoryData, severityData, crossAnalysisData, timeOfDayData } = analyticsData

    const monthlyData = trendData.map(item => [item.name, item.incidents])
    const categoryDataCSV = categoryData.map(item => [item.category, item.incidents])
    const severityDataCSV = severityData.map(item => [item.name, item.value])
    
    const orderedLevels = ['レベル1', 'レベル2', 'レベル3a', 'レベル3b', 'レベル4', 'レベル5']
    const crossAnalysisCSV = [
      ['カテゴリー', ...orderedLevels],
      ...Object.entries(crossAnalysisData).map(([category, levels]) => [
        category,
        ...orderedLevels.map(level => levels[level] || 0)
      ])
    ]

    const timeOfDayCSV = timeOfDayData.map(item => [item.hour, item.incidents])

    const csvContent = [
      ['月別インシデント件数'],
      ['月', '件数'],
      ...monthlyData,
      [''],
      ['カテゴリー別件数'],
      ['カテゴリー', '件数'],
      ...categoryDataCSV,
      [''],
      ['重要度別件数'],
      ['重要度', '件数'],
      ...severityDataCSV,
      [''],
      ['カテゴリー別重要度クロス分析'],
      ...crossAnalysisCSV,
      [''],
      ['時間帯別インシデント発生率'],
      ['時間', '件数'],
      ...timeOfDayCSV
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'incident_analysis.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const CardSkeleton = () => (
    <Card className="dark:border-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[100px] mb-2" />
        <Skeleton className="h-4 w-[150px]" />
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">インシデント分析</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  if (!analyticsData) {
    return <div className="flex justify-center items-center h-screen">No data available</div>
  }

  const adjustTimeOfDayData = (data: Array<{ hour: string; incidents: number }>) => {
    return data.map(item => ({
      ...item,
      hour: `${(parseInt(item.hour) + 9) % 24}:00` // Adjust for Japan Standard Time (UTC+9)
    })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
  }

  const { totalIncidents, severeIncidents, trendData, categoryData, severityData, crossAnalysisData, timeOfDayData } = analyticsData

  const adjustedTimeOfDayData = adjustTimeOfDayData(timeOfDayData)

  const orderedLevels = ['レベル1', 'レベル2', 'レベル3a', 'レベル3b', 'レベル4', 'レベル5']

  const sortedPieChartData = orderedLevels
    .map(level => {
      const found = severityData.find(entry => entry.name === level)
      return found ? found : { name: level, value: 0 }
    })
    .filter(entry => entry.value > 0)

  const crossAnalysisChartData = Object.entries(crossAnalysisData).map(([category, levels]) => ({
    category,
    ...levels,
  }))

  const renderMedicationAnalysis = () => {
    if (!analyticsData || !analyticsData.medicationData) return null

    const { totalMedicationIncidents, medicationDetails } = analyticsData.medicationData

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>薬物関連インシデント分析</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {totalMedicationIncidents}</p>
            <h3 className="text-lg font-semibold mt-4">薬物詳細カテゴリ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={medicationDetails}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="detail" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="件数" fill="#82ca9d" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTubeAnalysis = () => {
    if (!analyticsData || !analyticsData.tubeData) return null

    const { totalTubeIncidents, tubeDetails } = analyticsData.tubeData

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>チューブ関連インシデント分析</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {totalTubeIncidents}</p>
            <h3 className="text-lg font-semibold mt-4">チューブ詳細カテゴリ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={tubeDetails}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="detail" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="件数" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }


  const renderFactorsAnalysis = () => {
    if (!analyticsData || !analyticsData.factorsData) return null

    const factorTypes = [
      { key: "involvedPartyFactors", title: "当事者要因" },
      { key: "workBehavior", title: "作業行動" },
      { key: "physicalCondition", title: "身体的状況" },
      { key: "psychologicalState", title: "心理的状況" },
      { key: "medicalEquipment", title: "医療機器" },
      { key: "medication", title: "薬剤" },
      { key: "system", title: "システム" },
      { key: "cooperation", title: "協力体制" },
      { key: "explanation", title: "説明" },
    ]

    return (
      <div className="space-y-4">
        {factorTypes.map(({ key, title }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={analyticsData.factorsData[key] || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="件数" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">インシデント分析</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">過去7日間</SelectItem>
              <SelectItem value="last30days">過去30日間</SelectItem>
              <SelectItem value="last3months">過去3ヶ月間</SelectItem>
              <SelectItem value="lastyear">過去1年間</SelectItem>
              <SelectItem value="custom">カスタム期間</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === "custom" && (
            <>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)} // 修正
                selectsStart
                startDate={startDate ?? undefined} // 修正
                endDate={endDate ?? undefined} // 修正
                placeholderText="開始日"
                locale="ja"
                dateFormat="yyyy/MM/dd"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate ?? undefined} // 修正
                endDate={endDate ?? undefined} // 修正
                minDate={startDate?? undefined} //修正
                placeholderText="終了日"
                locale="ja"
                dateFormat="yyyy/MM/dd"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </>
          )}
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="部門を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部門</SelectItem>
              <SelectItem value="1病棟">1病棟</SelectItem>
              <SelectItem value="3病棟">3病棟</SelectItem>
              <SelectItem value="5病棟">5病棟</SelectItem>
              <SelectItem value="6病棟">6病棟</SelectItem>
              <SelectItem value="7病棟">7病棟</SelectItem>
              <SelectItem value="医局">医局</SelectItem>
              <SelectItem value="外来">外来</SelectItem> 
              <SelectItem value="薬剤科">薬剤科</SelectItem>
              <SelectItem value="リハビリ科">リハビリ科</SelectItem>
              <SelectItem value="検査科">検査科</SelectItem>
              <SelectItem value="放射線科">放射線科</SelectItem>
              <SelectItem value="臨床工学科">臨床工学科</SelectItem>
              <SelectItem value="栄養科">栄養科</SelectItem>
              <SelectItem value="医事課">医事課</SelectItem>
              <SelectItem value="経理課">経理課</SelectItem>
              <SelectItem value="人事課">人事課</SelectItem>
              <SelectItem value="総務課">総務課</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          データ出力
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
        <Card className='dark:border-white'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総インシデント数</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents.current}</div>
            <p className="text-xs text-muted-foreground">
              前月比 {calculatePercentageChange(totalIncidents.current, totalIncidents.previous) > 0 ? '+' : ''}
              {calculatePercentageChange(totalIncidents.current, totalIncidents.previous)}%
            </p>
          </CardContent>
        </Card>
        <Card className='dark:border-white'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">重大インシデント</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severeIncidents.current}</div>
            <p className="text-xs text-muted-foreground">
              前月比 {calculatePercentageChange(severeIncidents.current, severeIncidents.previous) > 0 ? '+' : ''}
              {calculatePercentageChange(severeIncidents.current, severeIncidents.previous)}%
            </p>
          </CardContent>
        </Card>
      </div>


      <Tabs defaultValue="trends" className="space-y-4 className='dark:border-white'">
        <TabsList className='dark:border-white'>
          <TabsTrigger value="trends">トレンド</TabsTrigger>
          <TabsTrigger value="categories">カテゴリー別</TabsTrigger>
          <TabsTrigger value="medication-analysis">薬物分析</TabsTrigger>
          <TabsTrigger value="tube-analysis">チューブ分析</TabsTrigger>
          <TabsTrigger value="severity">重要度別</TabsTrigger>
          <TabsTrigger value="cross-analysis">クロス分析</TabsTrigger>
          <TabsTrigger value="time-of-day">時間帯別</TabsTrigger>        
          <TabsTrigger value="factors-analysis">要因分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>インシデント発生トレンド</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="incidents" name="インシデント数" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別インシデント数</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" name="インシデント数" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medication-analysis" className="space-y-4">
          {renderMedicationAnalysis()}
        </TabsContent>
        <TabsContent value="tube-analysis" className="space-y-4">
          {renderTubeAnalysis()}
        </TabsContent>
        <TabsContent value="severity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>重要度別インシデント分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sortedPieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}件`}
                  >
                    {sortedPieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: 20,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cross-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別重要度クロス分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart
                  data={crossAnalysisChartData}
                  layout="vertical"
                  stackOffset="expand"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) =>   `${(value * 100).toFixed(0)}%`} />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const totalValue = payload.reduce((sum, entry) => sum + (entry.value as number), 0);
                      return (
                        <div className="bg-white p-2 border">
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {`${entry.name}: ${entry.value} (${((entry.value as number / totalValue) * 100).toFixed(1)}%)`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  {orderedLevels.map((level, index) => (
                    <Bar key={level} dataKey={level} stackId="a" fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-of-day" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>時間帯別インシデント発生率</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={adjustedTimeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: '時間', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'インシデント数', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" name="インシデント数" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="factors-analysis" className="space-y-4">
          {renderFactorsAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  )
}