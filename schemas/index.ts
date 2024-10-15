import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message:"※必須",
    }),
    password: z.string().min(1,{
        message:"※必須",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message:"※必須",
    }),
    password: z.string().min(6,{
        message:"6文字以上で設定してください",
    }),
    name: z.string().min(1,{
        message:"※必須",
    }),
});
