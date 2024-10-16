import NextAuth, { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import github from "next-auth/providers/github";
import authConfig from "@/auth.config";


export const config: NextAuthConfig = { // 修正: コロンの後にイコールを追加
  theme: {
    logo: "/icon-512.webp"
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ], 
  basePath: "/api/auth",
  pages: {
    signIn: "/login", // カスタムログインページのパス
  },
  
  callbacks: {
    authorized({ request, auth }){
        try {
            const { pathname } = request.nextUrl;
            const protectedPaths = ["/settings", "/create","/reports", "/analytics"];
            if(protectedPaths.includes(pathname)) return !!auth;
            return true;
        } catch (error) {
            console.log(error)
        }
    },
   async jwt({token,user}){
    if (user) { // User is available during sign-in
      token.sub = user.id
    }
    return token
  },
  
  },
};
export const { handlers, auth, signIn, signOut} =  NextAuth({
  session: { strategy: 'jwt' },
  ...authConfig,
}
);