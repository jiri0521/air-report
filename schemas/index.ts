import * as z from "zod"

export const RegisterSchema = z.object({
  staffNumber: z.string().min(1, {
    message: "職員番号を入力してください",
  }),
  name: z.string().min(1, {
    message: "名前を入力してください",
  }),
  password: z.string().min(6, {
    message: "パスワードは6文字以上で入力してください",
  }),
})

export const LoginSchema = z.object({
  staffNumber: z.string().min(1, {
    message: "職員番号を入力してください",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください",
  }),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "現在のパスワードを入力してください",
  }),
  newPassword: z.string().min(6, {
    message: "新しいパスワードは6文字以上で入力してください",
  }),
  confirmNewPassword: z.string().min(6, {
    message: "新しいパスワードを再入力してください",
  }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "新しいパスワードが一致しません",
  path: ["confirmNewPassword"],
})

