import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(params.id)
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(params.id)
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: { 
        title, 
        content,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(params.id)

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}