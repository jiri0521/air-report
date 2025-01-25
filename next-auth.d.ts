import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    staffNumber: string
    role: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      staffNumber: string
      role: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    staffNumber: string
    role: string
  }
}
