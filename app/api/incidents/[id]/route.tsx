import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from "@/auth"

const prisma = new PrismaClient()

function isValidISODateTime(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?Z?$/
  return regex.test(dateString)
}

function formatDateTimeForPrisma(dateTimeString: string): string | null {
  if (!dateTimeString) return null
  
  // If the date is already in ISO format, return it as is
  if (isValidISODateTime(dateTimeString)) return dateTimeString

  // If it's in the format "YYYY-MM-DDTHH:MM", add seconds and timezone
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeString)) {
    return dateTimeString + ':00Z'
  }

  // If it's in any other format, try to parse it and convert to ISO
  const date = new Date(dateTimeString)
  if (!isNaN(date.getTime())) {
    return date.toISOString()
  }

  return null
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const id = parseInt(params.id)
    const incidentData = await req.json()
    const { ...updateData } = incidentData

    // Format date fields
    const dateFields = ['occurrenceDateTime', 'reportToDoctor', 'reportToSupervisor']
    dateFields.forEach(field => {
      if (updateData[field]) {
        const formattedDate = formatDateTimeForPrisma(updateData[field])
        if (formattedDate) {
          updateData[field] = formattedDate
        } else {
          delete updateData[field] // Remove the field if it's invalid
        }
      }
    })

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