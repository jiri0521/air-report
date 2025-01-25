import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth" // 認証用モジュール

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 過去1週間以内にログインしたユーザーを取得
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const recentlyLoggedInUsers = await prisma.user.findMany({
      where: {
        lastLogin: {
          gte: oneWeekAgo.toISOString(),
        },
      },
      select: {
        id: true,
        name: true,
        staffNumber: true,
        role: true,
        lastLogin: true,
        lastLogout: true,
      },
      orderBy: {
        lastLogin: "desc",
      },
    })

    // 最近ログインしたユーザーのリストをJSON形式で返す
    return NextResponse.json(recentlyLoggedInUsers)
  } catch (error) {
    console.error("Error fetching recently logged-in users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
