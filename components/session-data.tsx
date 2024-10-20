import type { Session } from "next-auth";

export default function SessionData({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
     
        <div className="flex flex-col rounded-md bg-neutral-100">
          <div className="p-4 font-bold rounded-t-md bg-neutral-200">
            Session
          </div>
          <pre className="py-6 px-4 whitespace-pre-wrap break-all">
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