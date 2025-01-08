import NextAuth, { NextAuthConfig } from "next-auth"
import authConfig from "@/auth.config"
import { db } from "@/lib/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"

export const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account && user) {
        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: user.id!,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token as string | null,
            refresh_token: account.refresh_token as string | null,
            expires_at: account.expires_at as number | null,
            token_type: account.token_type as string | null,
            scope: account.scope as string | null,
            id_token: account.id_token as string | null,
            session_state: account.session_state as string | null,
          },
          update: {
            access_token: account.access_token as string | null,
            refresh_token: account.refresh_token as string | null,
            expires_at: account.expires_at as number | null,
            token_type: account.token_type as string | null,
            scope: account.scope as string | null,
            id_token: account.id_token as string | null,
            session_state: account.session_state as string | null,
          },
        });
      }
      return true;
    },
    authorized({ request, auth }) {
      try {
        const { pathname } = request.nextUrl;
        const protectedPaths = ["/","/settings", "/create", "/reports"];
        if (protectedPaths.includes(pathname)) return !!auth;
        return true;
      } catch (error) {
        console.log(error)
        return false;
      }
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
    },
    async createUser({ user }) {
      if (!user.id) return;
      await db.userSettings.create({
        data: {
          userId: user.id,
          name: user.name || "Default Name",
        }
      });
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  ...config,
});

