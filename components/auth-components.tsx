import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut } from "@/auth";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={async () => {
      "use server";
      await signIn(provider);
    }}>
      <Button className="bg-red-400" {...props}>ログイン</Button>
    </form>
  );
}

export function SignOut({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form className="w-full"
    action={async () => {
      "use server";
      await signOut();
    }}>
      <Button  variant="ghost" className="w-full p-0 bg-red-400 text-white" {...props}>
        ログアウト
      </Button>
    </form>
  );
}