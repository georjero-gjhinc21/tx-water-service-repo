"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function updateRequestStatus(id: string, status: string) {
  const supabase = createServiceClient();

  await supabase
    .from("water_service_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function deleteRequest(id: string) {
  const supabase = createServiceClient();

  await supabase
    .from("water_service_requests")
    .delete()
    .eq("id", id);

  revalidatePath("/admin");
}
