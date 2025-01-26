"use server"

import type * as z from "zod"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { getUserByStaffNumber } from "@/data/user"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values)
 
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { staffNumber, password } = validatedFields.data

  const existingUser = await getUserByStaffNumber(staffNumber)

  if (!existingUser || !existingUser.staffNumber || !existingUser.password) {
    return { error: "職員番号が存在しません!" }
  }

  try {
    // Update the lastLogin field
    await db.user.update({
      where: { staffNumber },
      data: { lastLogin: new Date() },
    })

    await signIn("credentials", {
      staffNumber,
      password,
      redirect: false,
    })

    // Use redirect function for server-side redirection
    redirect(DEFAULT_LOGIN_REDIRECT)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "無効な認証情報です!" }
        default:
          return { error: "エラーが発生しました!" }
      }
    }


    throw error
  }
}

