import { cookies } from "next/headers";

export async function getCurrentUser() {
  // For demo, no user object
  return null;
}

export async function userIsAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}
