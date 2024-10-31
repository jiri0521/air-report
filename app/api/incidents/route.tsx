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
    lt?: Date;
  };
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
      const endDate = month
        ? new Date(parseInt(year), parseInt(month), 0)
        : new Date(parseInt(year) + 1, 0, 1)

      whereClause.occurrenceDateTime = {
        gte: startDate,
        lt: endDate
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
    if (incidentData.reportToDoctor === '') {
      incidentData.reportToDoctor = null
    }
    if (incidentData.reportToSupervisor === '') {
      incidentData.reportToSupervisor = null
    }
    const newIncident = await prisma.incident.create({
      data: incidentData,
    })

    return NextResponse.json(newIncident)
  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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