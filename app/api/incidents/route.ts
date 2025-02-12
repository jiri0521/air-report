import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth";

const prisma = new PrismaClient()

interface WhereClause {
  OR?: Array<{
    details?: { contains: string; mode: 'insensitive' };
    category?: { contains: string; mode: 'insensitive' };
    involvedPartyProfession?: { contains: string; mode: 'insensitive' };
    patientId?: { contains: string; mode: 'insensitive' };
  }>;
  category?: string;
  isDeleted?: boolean;
  occurrenceDateTime?: {
    gte?: Date;
    lte?: Date;  // Changed from lt to lte
  };
}

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "デフォルトのウェブフックURL"

interface IncidentNotification {
  category: string
  department: string
  location: string
  occurrenceDateTime: Date | string
  impactLevel: string
  details: string
}

async function sendDiscordNotification(incident: IncidentNotification) {
  try {
    const message = {
      content: "新規インシデントレポートが登録されました",
      embeds: [
        {
          title: "インシデント詳細",
          color: 0x0099ff,
          fields: [
            {
              name: "カテゴリ",
              value: incident.category,
              inline: true,
            },
            {
              name: "発生部署",
              value: incident.department,
              inline: true,
            },
            {
              name: "発生場所",
              value: incident.location,
              inline: true,
            },
            {
              name: "発生日時",
              value: new Date(incident.occurrenceDateTime).toLocaleString("ja-JP"),
              inline: true,
            },
            {
              name: "影響レベル",
              value: incident.impactLevel,
              inline: true,
            },
            {
              name: "詳細",
              value: incident.details,
              inline: true,
            },
            {
              name: "レポッチ",
              value: "http://192.168.100.234:3000",
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
  } catch (error) {
    console.error("Discord notification error:", error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const sortField = searchParams.get('sortField') || 'occurrenceDateTime'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const showDeleted = searchParams.get('showDeleted') === 'true'
    const patientId = searchParams.get('patientId') || ''
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const skip = (page - 1) * perPage

    const whereClause: WhereClause = {
      isDeleted: showDeleted
    }

    if (search || patientId) {
      whereClause.OR = []
      if (search) {
        whereClause.OR.push(
          { details: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { involvedPartyProfession: { contains: search, mode: 'insensitive' } }
        )
      }
      if (patientId) {
        whereClause.OR.push({ patientId: { contains: patientId, mode: 'insensitive' } })
      }
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (year) {
      const startDate = new Date(parseInt(year), month ? parseInt(month) - 1 : 0, 1)
      let endDate: Date
      
      if (month) {
        // Set endDate to the last day of the selected month
        endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      } else {
        // If only year is selected, set endDate to the last day of the year
        endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999)
      }

      whereClause.occurrenceDateTime = {
        gte: startDate,
        lte: endDate  // Changed from lt to lte
      }
    }

    const [incidents, totalCount] = await Promise.all([
      prisma.incident.findMany({
        where: whereClause,
        skip,
        take: perPage,
        orderBy: { [sortField]: sortOrder as 'asc' | 'desc' },
      }),
      prisma.incident.count({ where: whereClause }),
    ])

    const totalPages = Math.ceil(totalCount / perPage)

    return NextResponse.json({ incidents, totalPages })
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const incidentData = await req.json()
    const { id, ...updateData } = incidentData

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedIncident)
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
 
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const incidentData = await req.json()
    if (incidentData.reportToDoctor === "") {
      incidentData.reportToDoctor = null
    }
    if (incidentData.reportToSupervisor === "") {
      incidentData.reportToSupervisor = null
    }

    const newIncident = await prisma.incident.create({
      data: incidentData,
    })

    // Send Discord notification
    await sendDiscordNotification(newIncident)

    return NextResponse.json(newIncident)
  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

  export async function DELETE(req: NextRequest) {
    try {
      const session = await auth()
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
  
      const { searchParams } = new URL(req.url)
      const id = parseInt(searchParams.get('id') || '')
  
      const updatedIncident = await prisma.incident.update({
        where: { id },
        data: { isDeleted: true },
      })
  
      return NextResponse.json(updatedIncident)
    } catch (error) {
      console.error('Error soft deleting incident:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }