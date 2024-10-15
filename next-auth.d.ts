import NextAuth,{type DefaultSession} from "next-auth";

export type ExtededUser = DefaultSession["user"] & {
  email: string;
  accessToken: string;  
  role: "ADMIN" | "USER" | "MANAGER"
};

declare module "next-auth"{
    interface Session{
      user: ExtededUser;
    } 
  }

