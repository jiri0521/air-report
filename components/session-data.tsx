import type { Session } from "next-auth";

export default function SessionData({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
     
        <div className="flex flex-col rounded-md bg-neutral-100 dark:border-gray-700 dark:bg-gray-700">
          <div className="p-4 font-bold rounded-t-md bg-neutral-200 dark:border-gray-200 dark:bg-gray-500">
            ログイン中のユーザー情報
          </div>
          <pre className="py-6 px-4 whitespace-pre-wrap break-all dark:border-gray-200 dark:bg-gray-700">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

    );
  }

  return (
    <p>
      No session data, please <em>Sign In</em> first.
    </p>
  );
}