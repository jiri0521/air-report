"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import Link from 'next/link'

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [shouldReload, setShouldReload] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (shouldReload) {
      window.location.href = DEFAULT_LOGIN_REDIRECT;
    }
  }, [shouldReload]);

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          } else if (data?.success) {
            setSuccess(data.success);
            if (data.needsReload) {
              setShouldReload(true);
            } else {
              router.push(data.redirectTo || DEFAULT_LOGIN_REDIRECT);
            }
          }
        })
        .catch(() => setError("An unexpected error occurred"));
    });
  };

  

  return (
    <CardWrapper
      headerLabel="さぁ、始めよう！"
      backButtonLabel="初めてのご利用はこちら➡︎"
      backButtonHref="/register"
      //showSocial
    >
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      disabled={isPending}
                      placeholder="sample@mail.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button 
            disabled={isPending}
            type="submit"
            className="w-full bg-blue-500"
          >
            ログイン
          </Button>
          <div className="flex items-center justify-center mt-4">
            <Link href="/password-reset/request" className="text-sm text-blue-600 hover:underline">
              パスワードを忘れた場合
            </Link>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};