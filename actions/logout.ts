"use server"

import { signOut } from "@/auth"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export const logout = async () => {
  try {
    const session = await auth()
    if (session?.user?.staffNumber) {
      await db.user.update({
        where: { staffNumber: session.user.staffNumber },
        data: { lastLogout: new Date() },
      })
    }
    await signOut()
  } catch (error) {
    console.error("ログアウト中にエラーが発生しました:", error)
  }
}


