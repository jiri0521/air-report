"use server";

import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const logout = async () => {
  try {
    const session = await auth();
    if (session?.user?.email) {
      await db.user.update({
        where: { email: session.user.email },
        data: { lastLogout: new Date() },
      });
    }
    await signOut();
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

