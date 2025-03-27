import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const session = await auth()
    if (!session || !session.user?.staffNumber) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    // Update the lastLogout time in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        lastLogout: new Date(),
      },
    })

    return NextResponse.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

