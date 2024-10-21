import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth'; // 認証用モジュール

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
  ) {
  try {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { role } = await req.json()
const userId = params.userId

const user = await prisma.user.findUnique({
  where: { id: userId },
})

if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 })
}

const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { role },
})

return NextResponse.json(updatedUser)
} catch (error) {
  console.error('Error updating user role:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  }