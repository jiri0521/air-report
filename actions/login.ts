"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/data/user";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false, // Change this to false to prevent automatic redirect
    });

    return { 
      success: "Logged in successfully!",
      redirectTo: DEFAULT_LOGIN_REDIRECT,
      needsReload: true // Add this flag
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "認証エラー" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};