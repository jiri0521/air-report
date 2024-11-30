import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "@/schemas"
import { getUserByEmail } from "@/data/user"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"

export default {
  providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await getUserByEmail(email)
          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password,
          );

          if (passwordsMatch) return user
        }

        return null;
      }
    })
  ],
  session:{
    maxAge:60*60,
    updateAge:60*60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
      }
      return session;
    },
  },
} satisfies NextAuthConfig

