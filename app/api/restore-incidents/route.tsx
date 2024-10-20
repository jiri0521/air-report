import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth";

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
    
        const { searchParams } = new URL(req.url)
        const id = parseInt(searchParams.get('id') || '')
    
        const updatedIncident = await prisma.incident.update({
          where: { id },
          data: { isDeleted: false },
        })
    
        return NextResponse.json(updatedIncident)
      } catch (error) {
        console.error('Error soft deleting incident:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
}


  