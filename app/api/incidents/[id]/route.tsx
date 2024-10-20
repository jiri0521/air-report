import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const id = parseInt(params.id)
    const incidentData = await req.json()
    const { ...updateData } = incidentData

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