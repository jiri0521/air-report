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
import { Settings } from "lucide-react"
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

// Get the first two characters of the user's name
const userInitials = session.user.name ? session.user.name.slice(0, 2) : "";

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
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">職員番号:{session.user.staffNumber}</p>
              <p className="text-xs leading-none text-muted-foreground">権限:{session.user.role}</p>
              
              <Link href="/change-password">
                <Button className="bg-pink-100 py-2 w-full rounded-md leading-none text-muted-foreground hover:bg-pink-400 hover:text-black" >
                  パスワード変更　<Settings className="text-gray-500" /></Button>
                  </Link>
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