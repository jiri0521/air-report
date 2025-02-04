import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const announcements = await prisma.announcement.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
    try {
      const session = await auth()
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
  
      const { title, content } = await req.json()
  
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          userId: session.user.id,
        },
      })
  
      return NextResponse.json(announcement)
    } catch (error) {
      console.error('Error creating announcement:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }