"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";

export async function register(values: z.infer<typeof RegisterSchema>) {
  const { email, password, name } = values;

  // メールアドレスの重複チェック
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  // ユーザーの作成
  const newUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { success:"アカウントの作成に成功しました" };

  
}
