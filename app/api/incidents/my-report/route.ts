import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const incidents = await prisma.incident.findMany({
      where: {
        userId: userId,
        isDeleted: false
      },
      orderBy: {
        occurrenceDateTime: 'desc'
      }
    })

    return NextResponse.json({ incidents })
  } catch (error) {
    console.error('Error fetching user incidents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}