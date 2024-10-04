"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, Repeat, TrendingUp } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

// Supabaseクライアントの初期化
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function Analytics() {
  const [dateRange, setDateRange] = useState("last30days")
  const [department, setDepartment] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [totalIncidents, setTotalIncidents] = useState(0)
  const [severeIncidents, setSevereIncidents] = useState(0)
  const [recurrenceRate, setRecurrenceRate] = useState<{ current: number; previous: number }>({ current: 0, previous: 0 })

  const [lineChartData, setLineChartData] = useState<LineChartData[]>([])
  const [barChartData, setBarChartData] = useState<BarChartData[]>([])
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([])
  const [crossAnalysisData, setCrossAnalysisData] = useState<CrossAnalysisData>({})
  const [previousPeriodComparison, setPreviousPeriodComparison] = useState({
    totalIncidents: 0,
    severeIncidents: 0,
    recurrenceRate: 0
  })
  const [timeOfDayData, setTimeOfDayData] = useState<TimeOfDayData[]>([])
 // Define types
type Incident = {
  id: number
  category: string
  location: string
  occurrenceDateTime: string
  impactLevel: string
}

interface LineChartData {
  name: string;
  incidents: number;
}

interface BarChartData {
  category: string;
  incidents: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface CrossAnalysisData {
  [category: string]: {
    [impactLevel: string]: number;
  };
}
  
type CrossAnalysisChartData = {
  category: string;
  [impactLevel: string]: number | string;
};
interface TimeOfDayData {
  hour: string;
  incidents: number;
}

useEffect(() => {
  fetchData()
}, [dateRange, department])

const fetchData = async () => {
  setLoading(true)
  setError(null)

  try {
    const [
      totalIncidentsData,
      severeIncidentsData,
      recurrenceRateData,
      trendData,
      categoryData,
      severityData,
      crossAnalysisData,
      previousPeriodData,
      timeOfDayData
    ] = await Promise.all([
      fetchTotalIncidents(),
      fetchSevereIncidents(),
      fetchRecurrenceRate(),
      fetchTrendData(),
      fetchCategoryData(),
      fetchSeverityData(),
      fetchCrossAnalysisData(),
      fetchPreviousPeriodData(),
      fetchTimeOfDayData()
    ])

    setTotalIncidents(totalIncidentsData.current)
    setSevereIncidents(severeIncidentsData.current)
    setRecurrenceRate(recurrenceRateData)
    setLineChartData(trendData)
    setBarChartData(categoryData)
    setPieChartData(severityData)
    setCrossAnalysisData(crossAnalysisData)
    setTimeOfDayData(timeOfDayData)
    setPreviousPeriodComparison({
      totalIncidents: calculatePercentageChange(totalIncidentsData.current, totalIncidentsData.previous),
      severeIncidents: calculatePercentageChange(severeIncidentsData.current, severeIncidentsData.previous),
      recurrenceRate: calculatePercentageChange(recurrenceRateData.current, recurrenceRateData.previous),
    
    })
  } catch (err) {
    setError('データの取得中にエラーが発生しました。')
    console.error('Error fetching data:', err)
  } finally {
    setLoading(false)
  }
}

const fetchTotalIncidents = async () => {
  const { count: currentCount, error: currentError } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .filter('occurrenceDateTime', 'gte', getDateRangeStart())
  
  const { count: previousCount, error: previousError } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .filter('occurrenceDateTime', 'gte', getPreviousPeriodStart())
    .filter('occurrenceDateTime', 'lt', getDateRangeStart())
  
  if (currentError || previousError) throw currentError || previousError
  return { current: currentCount || 0, previous: previousCount || 0 }
}

const fetchSevereIncidents = async () => {
  const { count: currentCount, error: currentError } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .filter('occurrenceDateTime', 'gte', getDateRangeStart())
    .in('impactLevel', ['レベル3b','レベル4', 'レベル5'])
  
  const { count: previousCount, error: previousError } = await supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .filter('occurrenceDateTime', 'gte', getPreviousPeriodStart())
    .filter('occurrenceDateTime', 'lt', getDateRangeStart())
    .in('impactLevel', ['レベル3b','レベル4', 'レベル5'])
  
  if (currentError || previousError) throw currentError || previousError
  return { current: currentCount || 0, previous: previousCount || 0 }
}

const fetchTrendData = async (): Promise<LineChartData[]> => {
  const { data, error } = await supabase
    .from('incidents')
    .select('occurrenceDateTime')
    .filter('occurrenceDateTime', 'gte', getDateRangeStart())
  
  if (error) throw error

  const trendData = data.reduce((acc: { [key: string]: { count: number, date: Date } }, incident) => {
    const date = new Date(incident.occurrenceDateTime)
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!acc[key]) {
      acc[key] = { count: 0, date: date }
    }
    acc[key].count++
    return acc
  }, {})

  return Object.entries(trendData)
    .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
    .map(([name, { count }]) => ({ name, incidents: count }))
}

const fetchCategoryData = async (): Promise<BarChartData[]> => {
  const { data, error } = await supabase
    .from('incidents')
    .select('category')
    .filter('occurrenceDateTime', 'gte', getDateRangeStart());

  if (error) throw error;

  const acc: Record<string, number> = {};
  data.forEach(incident => {
    acc[incident.category] = (acc[incident.category] || 0) + 1;
  });

  return Object.entries(acc).map(([category, incidents]) => ({ category, incidents }));
};

const fetchSeverityData = async (): Promise<PieChartData[]> => {
  const { data, error } = await supabase
    .from('incidents')
    .select('impactLevel')
    .filter('occurrenceDateTime', 'gte', getDateRangeStart())
  
  if (error) throw error

  const severityData = data.reduce((acc: Record<string, number>, incident) => {
    acc[incident.impactLevel] = (acc[incident.impactLevel] || 0) + 1
    return acc
  }, {})

  return Object.entries(severityData).map(([name, value]) => ({ name, value }))
}

const fetchCrossAnalysisData = async (): Promise<CrossAnalysisData> => {
  const { data, error } = await supabase
    .from('incidents')
    .select('category, impactLevel')
    .filter('occurrenceDateTime', 'gte', getDateRangeStart());

  if (error) throw error;

  const analysisData: CrossAnalysisData = data.reduce((acc: CrossAnalysisData, incident) => {
    const category = incident.category;
    const level = incident.impactLevel;

    if (!acc[category]) {
      acc[category] = {};
    }
    acc[category][level] = (acc[category][level] || 0) + 1;

    return acc;
  }, {});

  return analysisData;
};

const fetchRecurrenceRate = async () => {
  const currentPeriodStart = getDateRangeStart()
  const previousPeriodStart = getPreviousPeriodStart()

  const { data: currentData, error: currentError } = await supabase
    .from('incidents')
    .select('*')
    .filter('occurrenceDateTime', 'gte', currentPeriodStart)

  const { data: previousData, error: previousError } = await supabase
    .from('incidents')
    .select('*')
    .filter('occurrenceDateTime', 'gte', previousPeriodStart)
    .filter('occurrenceDateTime', 'lt', currentPeriodStart)

  if (currentError || previousError) throw currentError || previousError

  const currentRecurrenceRate = calculateRecurrenceRate(currentData as Incident[])
  const previousRecurrenceRate = calculateRecurrenceRate(previousData as Incident[])

  return { 
    current: currentRecurrenceRate, 
    previous: previousRecurrenceRate 
  }
}

const calculateRecurrenceRate = (incidents: Incident[]): number => {
  const totalIncidents = incidents.length
  if (totalIncidents === 0) return 0

  const recurringIncidents = incidents.filter(incident => 
    isRecurring(incident, incidents)
  ).length

  return (recurringIncidents / totalIncidents) * 100
}

const isRecurring = (incident: Incident, allIncidents: Incident[]): boolean => {
  return allIncidents.some(otherIncident => 
    otherIncident.id !== incident.id &&
    otherIncident.category === incident.category &&
    otherIncident.location === incident.location &&
    new Date(otherIncident.occurrenceDateTime) < new Date(incident.occurrenceDateTime)
  )
}

const fetchPreviousPeriodData = async () => {
  // Placeholder function, implement actual logic as needed
  return {
    totalIncidents: 1000,
    severeIncidents: 20,
    recurrenceRate: 10
  }
}

const getDateRangeStart = () => {
  const now = new Date()
  switch (dateRange) {
    case 'last7days':
      return new Date(now.setDate(now.getDate() - 7)).toISOString()
    case 'last30days':
      return new Date(now.setDate(now.getDate() - 30)).toISOString()
    case 'last3months':
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString()
    case 'lastyear':
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
    default:
      return new Date(now.setDate(now.getDate() - 30)).toISOString()
  }
}

const getPreviousPeriodStart = () => {
  const start = new Date(getDateRangeStart())
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return new Date(start.getTime() - diff).toISOString()
}

const fetchTimeOfDayData = async (): Promise<TimeOfDayData[]> => {
  const { data, error } = await supabase
    .from('incidents')
    .select('occurrenceDateTime')
    .filter('occurrenceDateTime', 'gte', getDateRangeStart())
  
  if (error) throw error

  const hourCounts: { [key: string]: number } = {}
  for (let i = 0; i < 24; i++) {
    hourCounts[i.toString().padStart(2, '0')] = 0
  }

  data.forEach(incident => {
    const hour = new Date(incident.occurrenceDateTime).getHours().toString().padStart(2, '0')
    hourCounts[hour]++
  })

  return Object.entries(hourCounts).map(([hour, incidents]) => ({
    hour: `${hour}:00`,
    incidents
  }))
}

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number(((current - previous) / previous * 100).toFixed(2))
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#000000']; // Add black for level 5

const handleExportCSV = () => {
  const csvContent = [
    ['カテゴリー', '件数'],
    ...barChartData.map(item => [item.category, item.incidents]),
    ['', ''],
    ['重要度', '件数'],
    ...pieChartData.map(item => [item.name, item.value])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'incident_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

if (loading) {
  return <div className="flex justify-center items-center h-screen">Loading...</div>
}

if (error) {
  return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
}

const orderedLevels = ['レベル1', 'レベル2', 'レベル3a', 'レベル3b', 'レベル4', 'レベル5'];

const sortedPieChartData = orderedLevels
  .map(level => {
    const found = pieChartData.find(entry => entry.name === level);
    return found ? found : { name: level, value: 0 };
  })
  .filter(entry => entry.value > 0);

  const crossAnalysisChartData: CrossAnalysisChartData[] =
  Object.entries(crossAnalysisData).map(([category, levels]) => ({
    category,
    ...levels,
  }));
  
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
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="部門を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部門</SelectItem>
              <SelectItem value="internal">内科</SelectItem>
              <SelectItem value="surgery">外科</SelectItem>
              <SelectItem value="pediatrics">小児科</SelectItem>
              <SelectItem value="emergency">救急</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportCSV}>
          <Calendar className="mr-2 h-4 w-4" />
          データ出力
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総インシデント数</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              前月比 {previousPeriodComparison.totalIncidents > 0 ? '+' : ''}
              {previousPeriodComparison.totalIncidents}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">重大インシデント</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              前月比 {previousPeriodComparison.severeIncidents > 0 ? '+' : ''}
              {previousPeriodComparison.severeIncidents}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">再発率</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurrenceRate.current.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              前月比 {(recurrenceRate.current - recurrenceRate.previous).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">トレンド</TabsTrigger>
          <TabsTrigger value="categories">カテゴリー別</TabsTrigger>
          <TabsTrigger value="severity">重要度別</TabsTrigger>
          <TabsTrigger value="cross-analysis">クロス分析</TabsTrigger>
          <TabsTrigger value="time-of-day">時間帯別</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>インシデント発生トレンド</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name"/>
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
                <RechartsBarChart data={barChartData}>
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
                  <XAxis type="number" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
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
                <RechartsBarChart data={timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" name="インシデント数" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
