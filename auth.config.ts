import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "@/schemas"
import { getUserByStaffNumber} from "@/data/user"
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
          const { staffNumber, password } = validatedFields.data

          const user = await getUserByStaffNumber(staffNumber)
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
   // クッキーに有効期限を設定しない（ブラウザセッションで自動的に終了）
   maxAge: 0,  // これでクッキーがブラウザのセッション終了時に消える
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.staffNumber = user.staffNumber
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
        session.user.staffNumber = token.staffNumber as string;
      } 
      return session;
    },
  },
} satisfies NextAuthConfig

