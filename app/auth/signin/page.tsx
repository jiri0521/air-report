"use client"

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert } from 'lucide-react';

export default function AccessRestricted() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // ログインに成功した場合のコールバック処理
      console.log('ログインに成功しました:', session);
      // ここに追加の処理を書くことができます
      // 例: 特定のページへリダイレクト
      window.location.href = '/'; // ホームページにリダイレクト
    }
  }, [status, session]);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-80">
        <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
          アクセス制限
          <TriangleAlert className="text-yellow-500 ml-2" />
        </h1>
        <p className="mb-4 text-center">右上のボタンからログインしてください。</p>
      </div>
    </div>
  );
}
