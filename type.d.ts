import NextAuth from 'next-auth'
import { DefaultSession } from "next-auth"

declare module 'next-auth' {
  interface User {
    role: string
  }
  
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
  }
}
