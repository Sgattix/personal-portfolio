import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { loginAction } from "../actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = searchParams ? await searchParams : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Restricted access
        </p>
        <h1 className="mt-3 text-3xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Enter the private password to manage portfolio content.
        </p>

        {params?.error === "invalid" && (
          <p className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Invalid password.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-neutral-300">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white"
              placeholder="Enter the admin password"
            />
          </label>

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-200"
          >
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}
