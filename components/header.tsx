import Image from "next/image";
import { MainNav } from "./main-nav";
import UserButton from "./user-button";
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 max-w-3xl px-8 mx-auto sm:px-6">
        <div className="flex items-center">
          {/* ロゴ画像 */}
          <Link href="/" passHref> {/* "/" に遷移 */}
      <Image
        src="/report-bg-remove-icon.png" // ロゴ画像のパスを指定
        alt="Logo"
        width={80} // 適切な幅を指定
        height={80} // 適切な高さを指定
        className="mr-8 hidden md:block" // スマホでは非表示、mdサイズ以上で表示、右にマージン
      />
    </Link>
          <MainNav />
        </div>
        <UserButton />
        
      </div>
    </header>
  );
}
