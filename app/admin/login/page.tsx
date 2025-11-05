"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null } as LoginState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin";

  return (
    <main className="min-h-screen grid place-items-center bg-zinc-50 p-6">
      <form action={formAction} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Admin Login</h1>
        <p className="mb-6 text-sm text-gray-600">
          Demo: Use username <strong>admin</strong> and password <strong>admin</strong>.
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
          <input
            name="username"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {state.error && (
          <p className="mb-3 text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
