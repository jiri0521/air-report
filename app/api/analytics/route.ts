import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { parseISO, subDays, subMonths, subYears } from 'date-fns';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

interface IncidentWithDateTime {
  occurrenceDateTime: Date;
}


interface RecurringIncident {
  id: number;
  category: string;
  location: string;
  occurrenceDateTime: Date;
}


export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateRange = searchParams.get("dateRange")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const department = searchParams.get("department") || "all"

    let dateRangeStart: Date
    let dateRangeEnd: Date = new Date()

    if (startDate && endDate) {
      dateRangeStart = parseISO(startDate)
      dateRangeEnd = parseISO(endDate)
    } else {
      dateRangeStart = getDateRangeStart(dateRange || "last30days")
    }

    const previousPeriodStart = getPreviousPeriodStart(dateRangeStart, dateRangeEnd)

    const [
      totalIncidents,
      severeIncidents,
      recurrenceRate,
      trendData,
      categoryData,
      severityData,
      crossAnalysisData,
      timeOfDayData,
      factorsData,
      medicationData,
      tubeData,
    ] = await Promise.all([
      fetchTotalIncidents(dateRangeStart, dateRangeEnd, previousPeriodStart, department),
      fetchSevereIncidents(dateRangeStart, dateRangeEnd, previousPeriodStart, department),
      fetchRecurrenceRate(dateRangeStart, dateRangeEnd, previousPeriodStart, department),
      fetchTrendData(dateRangeStart, dateRangeEnd, department),
      fetchCategoryData(dateRangeStart, dateRangeEnd, department),
      fetchSeverityData(dateRangeStart, dateRangeEnd, department),
      fetchCrossAnalysisData(dateRangeStart, dateRangeEnd, department),
      fetchTimeOfDayData(dateRangeStart, dateRangeEnd, department),
      fetchFactorsData(dateRangeStart, dateRangeEnd, department),
      fetchMedicationData(dateRangeStart, dateRangeEnd, department),
      fetchTubeData(dateRangeStart, dateRangeEnd, department),
    ])

    return NextResponse.json({
      totalIncidents,
      severeIncidents,
      recurrenceRate,
      trendData,
      categoryData,
      severityData,
      crossAnalysisData,
      timeOfDayData,
      factorsData,
      medicationData,
      tubeData,
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


function getDateRangeStart(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case 'last7days':
      return subDays(now, 7);
    case 'last30days':
      return subDays(now, 30);
    case 'last3months':
      return subMonths(now, 3);
    case 'lastyear':
      return subYears(now, 1);
    default:
      return subDays(now, 30);
  }
}

function getPreviousPeriodStart(start: Date, end: Date): Date {
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() - diff);
}

async function fetchTotalIncidents(dateRangeStart: Date, dateRangeEnd: Date, previousPeriodStart: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {}),
    occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd }
  };
  const [currentCount, previousCount] = await Promise.all([
    prisma.incident.count({
      where: whereClause
    }),
    prisma.incident.count({
      where: {
        ...whereClause,
        occurrenceDateTime: {
          gte: previousPeriodStart,
          lt: dateRangeStart
        }
      }
    })
  ]);
  
  return { current: currentCount, previous: previousCount };
}


async function fetchSevereIncidents(dateRangeStart: Date, dateRangeEnd: Date, previousPeriodStart: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {}),
    impactLevel: { in: ['レベル3b', 'レベル4', 'レベル5'] }
  };
  const [currentCount, previousCount] = await Promise.all([
    prisma.incident.count({
      where: {
        ...whereClause,
        occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd }
      }
    }),
    prisma.incident.count({
      where: {
        ...whereClause,
        occurrenceDateTime: {
          gte: previousPeriodStart,
          lt: dateRangeStart
        }
      }
    })
  ]);
  
  return { current: currentCount, previous: previousCount };
}

async function fetchTrendData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {})
  };
  const incidents = await prisma.incident.findMany({
    where: { 
      ...whereClause,
      occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd } 
    },
    select: { occurrenceDateTime: true },
    orderBy: {
      occurrenceDateTime: 'asc' // 昇順で並べる
    }
  });
  
    const trendData = incidents.reduce((acc: Record<string, number>, incident: IncidentWithDateTime) => {
      const date = new Date(incident.occurrenceDateTime);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
    return Object.entries(trendData)
      .map(([name, incidents]) => ({ name, incidents }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }
  

  async function fetchCategoryData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
    const whereClause = {
      isDeleted: false,
      ...(department !== 'all' ? { department } : {})
    };
    const incidents = await prisma.incident.findMany({
      where: { 
        ...whereClause,
        occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd } 
      },
      select: { category: true }
    });

  const categoryData = incidents.reduce((acc: { [key: string]: number }, incident) => {
    acc[incident.category] = (acc[incident.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryData).map(([category, incidents]) => ({ category, incidents }));
}

async function fetchSeverityData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {})
  };
  const incidents = await prisma.incident.findMany({
    where: { 
      ...whereClause,
      occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd } 
    },
    select: { impactLevel: true }
  });
  const severityData = incidents.reduce((acc: { [key: string]: number }, incident) => {
    acc[incident.impactLevel] = (acc[incident.impactLevel] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(severityData).map(([name, value]) => ({ name, value }));
}

async function fetchCrossAnalysisData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {})
  };
  const incidents = await prisma.incident.findMany({
    where: { 
      ...whereClause,
      occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd } 
    },
    select: { category: true, impactLevel: true }
  });

  return incidents.reduce((acc: { [category: string]: { [impactLevel: string]: number } }, incident) => {
    if (!acc[incident.category]) {
      acc[incident.category] = {};
    }
    acc[incident.category][incident.impactLevel] = (acc[incident.category][incident.impactLevel] || 0) + 1;
    return acc;
  }, {});
}

async function fetchRecurrenceRate(dateRangeStart: Date, previousPeriodStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== 'all' ? { department } : {})
  };
  const [currentIncidents, previousIncidents] = await Promise.all([
    prisma.incident.findMany({
      where: { 
        ...whereClause,
        occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd } 
      },
      select: { id: true, category: true, location: true, occurrenceDateTime: true }
    }),
    prisma.incident.findMany({
      where: { 
        ...whereClause,
        occurrenceDateTime: { 
          gte: previousPeriodStart,
          lt: dateRangeStart
        } 
      },
      select: { id: true, category: true, location: true, occurrenceDateTime: true }
    })
  ]);

  const currentRate = calculateRecurrenceRate(currentIncidents);
  const previousRate = calculateRecurrenceRate(previousIncidents);

  return { current: currentRate, previous: previousRate };
}

function calculateRecurrenceRate(incidents: RecurringIncident[]): number {
    const totalIncidents = incidents.length;
    if (totalIncidents === 0) return 0;
  
    const recurringIncidents = incidents.filter(incident => 
      isRecurring(incident, incidents)
    ).length;
  
    return (recurringIncidents / totalIncidents) * 100;
  }
  
  function isRecurring(incident: RecurringIncident, allIncidents: RecurringIncident[]): boolean {
    return allIncidents.some(otherIncident => 
      otherIncident.id !== incident.id &&
      otherIncident.category === incident.category &&
      otherIncident.location === incident.location &&
      new Date(otherIncident.occurrenceDateTime) < new Date(incident.occurrenceDateTime)
    );
  }
  

  async function fetchTimeOfDayData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
    const whereClause = {
      isDeleted: false,
      ...(department !== 'all' ? { department } : {}),
      occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd }
    };
    const incidents = await prisma.incident.findMany({
      where: whereClause,
      select: { occurrenceDateTime: true }
    });
  


  const hourCounts: { [key: string]: number } = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i.toString().padStart(2, '0')] = 0;
  }

  incidents.forEach(incident => {
    const hour = new Date(incident.occurrenceDateTime).getHours().toString().padStart(2, '0');
    hourCounts[hour]++;
  });

  return Object.entries(hourCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([hour, incidents]) => ({
      hour: `${hour}:00`,
      incidents
    }));
}

async function fetchMedicationData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== "all" ? { department } : {}),
    occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd },
    category: "薬物",
  }

  const medicationIncidents = await prisma.incident.findMany({
    where: whereClause,
    select: {
      medicationDetail: true,
    },
  })

  const medicationDetails = medicationIncidents.reduce(
    (acc, incident) => {
      if (incident.medicationDetail) {
        acc[incident.medicationDetail] = (acc[incident.medicationDetail] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalMedicationIncidents: medicationIncidents.length,
    medicationDetails: Object.entries(medicationDetails).map(([detail, count]) => ({ detail, count })),
  }
}

async function fetchTubeData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== "all" ? { department } : {}),
    occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd },
    category: "チューブ類",
  }

  const tubeIncidents = await prisma.incident.findMany({
    where: whereClause,
    select: {
      tubeDetail: true,
    },
  })

  const tubeDetails = tubeIncidents.reduce(
    (acc, incident) => {
      if (incident.tubeDetail) {
        acc[incident.tubeDetail] = (acc[incident.tubeDetail] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalTubeIncidents: tubeIncidents.length,
    tubeDetails: Object.entries(tubeDetails).map(([detail, count]) => ({ detail, count })),
  }
}

async function fetchFactorsData(dateRangeStart: Date, dateRangeEnd: Date, department: string) {
  const whereClause = {
    isDeleted: false,
    ...(department !== "all" ? { department } : {}),
    occurrenceDateTime: { gte: dateRangeStart, lte: dateRangeEnd },
  }

  const incidents = await prisma.incident.findMany({
    where: whereClause,
    select: {
      involvedPartyFactors: true,
      workBehavior: true,
      physicalCondition: true,
      psychologicalState: true,
      medicalEquipment: true,
      medication: true,
      system: true,
      cooperation: true,
      explanation: true,
    },
  })

  const factorsData: Record<string, Record<string, number>> = {
    involvedPartyFactors: {},
    workBehavior: {},
    physicalCondition: {},
    psychologicalState: {},
    medicalEquipment: {},
    medication: {},
    system: {},
    cooperation: {},
    explanation: {},
  }

  incidents.forEach((incident) => {
    Object.keys(factorsData).forEach((factor) => {
      ;(incident[factor as keyof typeof incident] as string[]).forEach((item) => {
        factorsData[factor][item] = (factorsData[factor][item] || 0) + 1
      })
    })
  })

  return Object.entries(factorsData).reduce(
    (acc, [factor, data]) => {
      acc[factor] = Object.entries(data).map(([name, count]) => ({ name, count }))
      return acc
    },
    {} as Record<string, Array<{ name: string; count: number }>>,
  )
}