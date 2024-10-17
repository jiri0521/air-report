import React from "react";
import Link from "next/link";

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage: React.FC<ErrorProps> = ({ statusCode, message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-red-500">
          {statusCode || "エラー"}
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          {message || "申し訳ありませんが、問題が発生しました。"}
        </p>
        {statusCode === 404 ? (
          <p className="text-gray-500 mt-2">ページが見つかりません。</p>
        ) : (
          <p className="text-gray-500 mt-2">サーバーで問題が発生しました。</p>
        )}
        <Link href="/">
          <a className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
            ホームに戻る
          </a>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
