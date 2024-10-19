import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";

const prisma = new PrismaClient();

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('dateRange') || 'last30days';

    const dateRangeStart = getDateRangeStart(dateRange);
    const previousPeriodStart = getPreviousPeriodStart(dateRangeStart);

    const [
      totalIncidents,
      severeIncidents,
      recurrenceRate,
      trendData,
      categoryData,
      severityData,
      crossAnalysisData,
      timeOfDayData
    ] = await Promise.all([
      fetchTotalIncidents(dateRangeStart, previousPeriodStart),
      fetchSevereIncidents(dateRangeStart, previousPeriodStart),
      fetchRecurrenceRate(dateRangeStart, previousPeriodStart),
      fetchTrendData(dateRangeStart),
      fetchCategoryData(dateRangeStart),
      fetchSeverityData(dateRangeStart),
      fetchCrossAnalysisData(dateRangeStart),
      fetchTimeOfDayData(dateRangeStart)
    ]);

    return NextResponse.json({
      totalIncidents,
      severeIncidents,
      recurrenceRate,
      trendData,
      categoryData,
      severityData,
      crossAnalysisData,
      timeOfDayData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


function getDateRangeStart(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case 'last7days':
      return new Date(now.setDate(now.getDate() - 7));
    case 'last30days':
      return new Date(now.setDate(now.getDate() - 30));
    case 'last3months':
      return new Date(now.setMonth(now.getMonth() - 3));
    case 'lastyear':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
}

function getPreviousPeriodStart(start: Date): Date {
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return new Date(start.getTime() - diff);
}

async function fetchTotalIncidents(dateRangeStart: Date, previousPeriodStart: Date) {
  const [currentCount, previousCount] = await Promise.all([
    prisma.incident.count({
      where: { occurrenceDateTime: { gte: dateRangeStart } }
    }),
    prisma.incident.count({
      where: {
        occurrenceDateTime: {
          gte: previousPeriodStart,
          lt: dateRangeStart
        }
      }
    })
  ]);
  
  return { current: currentCount, previous: previousCount };
}

async function fetchSevereIncidents(dateRangeStart: Date, previousPeriodStart: Date) {
  const [currentCount, previousCount] = await Promise.all([
    prisma.incident.count({
      where: {
        occurrenceDateTime: { gte: dateRangeStart },
        impactLevel: { in: ['レベル3b', 'レベル4', 'レベル5'] }
      }
    }),
    prisma.incident.count({
      where: {
        occurrenceDateTime: {
          gte: previousPeriodStart,
          lt: dateRangeStart
        },
        impactLevel: { in: ['レベル3b', 'レベル4', 'レベル5'] }
      }
    })
  ]);
  
  return { current: currentCount, previous: previousCount };
}

async function fetchTrendData(dateRangeStart: Date) {
    const incidents = await prisma.incident.findMany({
      where: { occurrenceDateTime: { gte: dateRangeStart } },
      select: { occurrenceDateTime: true }
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
  

async function fetchCategoryData(dateRangeStart: Date) {
  const incidents = await prisma.incident.findMany({
    where: { occurrenceDateTime: { gte: dateRangeStart } },
    select: { category: true }
  });

  const categoryData = incidents.reduce((acc: { [key: string]: number }, incident) => {
    acc[incident.category] = (acc[incident.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryData).map(([category, incidents]) => ({ category, incidents }));
}

async function fetchSeverityData(dateRangeStart: Date) {
  const incidents = await prisma.incident.findMany({
    where: { occurrenceDateTime: { gte: dateRangeStart } },
    select: { impactLevel: true }
  });

  const severityData = incidents.reduce((acc: { [key: string]: number }, incident) => {
    acc[incident.impactLevel] = (acc[incident.impactLevel] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(severityData).map(([name, value]) => ({ name, value }));
}

async function fetchCrossAnalysisData(dateRangeStart: Date) {
  const incidents = await prisma.incident.findMany({
    where: { occurrenceDateTime: { gte: dateRangeStart } },
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

async function fetchRecurrenceRate(dateRangeStart: Date, previousPeriodStart: Date) {
  const [currentIncidents, previousIncidents] = await Promise.all([
    prisma.incident.findMany({
      where: { occurrenceDateTime: { gte: dateRangeStart } },
      select: { id: true, category: true, location: true, occurrenceDateTime: true }
    }),
    prisma.incident.findMany({
      where: { 
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
  

async function fetchTimeOfDayData(dateRangeStart: Date) {
  const incidents = await prisma.incident.findMany({
    where: { occurrenceDateTime: { gte: dateRangeStart } },
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