import { auth } from "@/auth";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SignOut } from "@/components/auth-components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, UserRound } from "lucide-react"
import Link from "next/link"

export default async function UserButton() {
    
  const session = await auth();
   // ユーザーがログインしていない場合
  if (!session?.user) {
    return (
      <div>
        <Link href="/login">
          <Button className="bg-red-400 rouded-xl">ログイン</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="hidden text-sm sm:inline-flex"></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8">
              { session.user.image && (
              <AvatarImage 
               src={session.user.image}
               alt={session.user.name ?? ""}
              />
              )}
              <AvatarFallback><UserRound/></AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
              <Link href="/settings">
              
                <Button className="bg-orange-100 py-2 w-full rounded-md leading-none text-muted-foreground hover:bg-orange-400 hover:text-black" >
                  設定　<Settings className="text-gray-500" /></Button>
              </Link>
              </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}