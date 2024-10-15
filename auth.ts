import NextAuth, { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import Github from "next-auth/providers/github";
import authConfig from "@/auth.config";



import { LoginSchema } from "@/schemas";

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
            credentials: {
                email: { label: "メールアドレス", type: "email" },
                password: { label: "パスワード", type: "password" },
            },
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (!validatedFields.success) {
                    return null;
                }

                const { email, password } = validatedFields.data;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `email_address=${email}&password=${password}`
                });

                const token = await res.json();

                if (token) {
                    return { email: email as string, accessToken: token.access_token };
                }
                return null;
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut} =  NextAuth({
  session: { strategy: 'jwt' },
  ...authConfig,
});
