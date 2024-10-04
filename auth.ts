import NextAuth, { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
 
export const config: NextAuthConfig = { // 修正: コロンの後にイコールを追加
  theme: {
    logo: "/icon-512.webp"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ], 
  basePath: "/api/auth",
  pages: {
    signIn: "/auth/signin", // カスタムログインページのパス
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
    jwt({token,trigger,session}){
        if (trigger === "update") token.name = session.user.name
        return token;
    },
  },
};
export const { handlers, auth, signIn, signOut} = NextAuth(config)