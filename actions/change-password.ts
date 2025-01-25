"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ChangePasswordSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { auth } from "@/auth";

export const changePassword = async (
  values: z.infer<typeof ChangePasswordSchema>
) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "認証されていません。" };
  }

  const validatedFields = ChangePasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const user = await getUserById(session.user.id);

  if (!user || !user.password) {
    return { error: "ユーザーが見つかりません。" };
  }

  const passwordsMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordsMatch) {
    return { error: "現在のパスワードが正しくありません。" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: user.id },
    data: { 
      password: hashedPassword,
      hasChangedPassword: true
    },
  });

  return { success: "パスワードが変更されました。", shouldRedirect: true };
};

