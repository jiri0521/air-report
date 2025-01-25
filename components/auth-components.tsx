import React from "react";
import { Button } from "./ui/button";
import { auth, signIn, signOut } from "@/auth";
import { db } from "@/lib/db";

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
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form className="w-full"
    
    action={async () => {
      "use server"
      const session = await auth();
    if (session?.user?.staffNumber) {
      await db.user.update({
        where: { staffNumber: session.user.staffNumber},
        data: { lastLogout: new Date() },
      });
    }
    await signOut();
    }}>
      <Button  variant="ghost" className="w-full p-0 bg-red-400 text-white" {...props}>
        ログアウト
      </Button>
    </form>
  );
}
