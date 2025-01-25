"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByStaffNumber } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { staffNumber, name, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByStaffNumber(staffNumber);

  if (existingUser) {
    return { error: "この職員番号は既に登録されています!" };
  }

  try {
    await db.user.create({
      data: {
        name,
        staffNumber,
        password: hashedPassword,
        // Do not include the email field at all
      },
    });

    return { success: "ユーザー登録が完了しました!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "ユーザー登録中にエラーが発生しました。" };
  }
};

