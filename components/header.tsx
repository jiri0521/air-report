import Image from "next/image";
import { MainNav } from "./main-nav";
import UserButton from "./user-button";

export default function Header() {
  return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 max-w-3xl px-8 mx-auto sm:px-6">
        <div className="flex items-center">
          {/* ロゴ画像 */}
          <Image
            src="/icon-512.webp" // ロゴ画像のパスを指定
            alt="Logo"
            width={40} // 適切な幅を指定
            height={40} // 適切な高さを指定
            className="mr-8" // 右にマージンを追加（必要に応じて）
          />
          <MainNav />
        </div>
        <UserButton />
      </div>
    </header>
  );
}
