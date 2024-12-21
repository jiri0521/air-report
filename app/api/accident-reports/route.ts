// app/api/accident-reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function GET() {
    try {
      const accidentReports = await prisma.accidentReport.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'desc' },
      })
      return NextResponse.json({ accidentReports })
    } catch (error) {
      console.error('Error fetching accident reports:', error)
      return NextResponse.json({ error: 'Failed to fetch accident reports' }, { status: 500 })
    }
  }

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const department = formData.get('department') as string | null
    const date = formData.get('date') as string | null

    if (!file || !department || !date) {
      return NextResponse.json({ error: 'File, department, count, and date are required' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const filename = Date.now() + '-' + file.name.replace(/\s/g, '-')
    const filepath = path.join(process.cwd(), 'public/uploads', filename)

    await writeFile(filepath, Buffer.from(buffer))

    const fileUrl = `/uploads/${filename}`
    const newReport = await prisma.accidentReport.create({
      data: {
        department,
        fileUrl,
        fileType: file.type,
        date: new Date(date),
        isDeleted: false,
      },
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    console.error('Error creating accident report:', error)
    return NextResponse.json({ error: 'Failed to create accident report' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const report = await prisma.accidentReport.findUnique({
      where: { id: parseInt(id, 10) },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    await prisma.accidentReport.update({
      where: { id: parseInt(id, 10) },
      data: { isDeleted: true },
    })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting accident report:', error)
    return NextResponse.json({ error: 'Failed to delete accident report' }, { status: 500 })
  }
}

