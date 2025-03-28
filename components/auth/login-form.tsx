"use client"

import type * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"

import { LoginSchema } from "@/schemas"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { login } from "@/actions/login"
import Link from "next/link"

export const LoginForm = () => {
  
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      staffNumber: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            form.reset()
            setError(data.error)
          }
          
        })
        .catch(() => setError("エラーが発生しました"))
    })
  }

  return (
    <CardWrapper headerLabel="ログイン" backButtonLabel="アカウントをお持ちでない方はこちら" backButtonHref="/register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="staffNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>職員番号</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="職員番号を入力してください" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="******" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="link" className="px-0 font-normal" asChild>
              <Link href="/forgot-password">パスワードを忘れた方へ</Link>
            </Button>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            ログイン
          </Button>
          
        </form>
      </Form>
    </CardWrapper>
  )
}


