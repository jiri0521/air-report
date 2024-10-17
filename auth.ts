import NextAuth, { NextAuthConfig } from "next-auth"
//import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config"
import { db } from "@/lib/db"

export const config: NextAuthConfig = {
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ request, auth }) {
      try {
        const { pathname } = request.nextUrl;
        const protectedPaths = ["/settings", "/create", "/reports", "/analytics"];
        if (protectedPaths.includes(pathname)) return !!auth;
        return true;
      } catch (error) {
        console.log(error)
        return false;
      }
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string, // 型を明示的に指定
        role: token.role as string, // 型を明示的に指定
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },

  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  ...config,
});
