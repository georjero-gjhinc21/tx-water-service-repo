"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectToRaw = formData.get("redirectTo")?.toString() ?? "/admin";

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Simple demo authentication - in production, use proper auth
  if (username === "admin" && password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      path: "/",
      maxAge: 86400, // 24 hours
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    const redirectTo = redirectToRaw.startsWith("/admin") ? redirectToRaw : "/admin";
    redirect(redirectTo);
  } else {
    return { error: "Invalid username or password" };
  }
}
