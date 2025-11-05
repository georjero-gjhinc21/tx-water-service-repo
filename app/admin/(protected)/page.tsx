import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { userIsAdmin } from "@/lib/admin";
import { deleteRequest, updateRequestStatus } from "../actions";

export default async function AdminHome() {
  const isAdmin = await userIsAdmin();
  if (!isAdmin) {
    return (
      <div className="rounded-md border bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">Access restricted</h2>
        <p className="text-sm text-zinc-600">
          Your account is not an admin for this project. Ask the owner to add you.
        </p>
      </div>
    );
  }

  const supabase = createServerClient();
  const { data: requests } = await supabase
    .from("water_service_requests")
    .select(
      "id, applicant_name, applicant_email, applicant_phone, property_use_type, status, service_start_date, service_stop_date, service_address, service_city, service_state, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Water Service Requests</h1>
          <p className="text-sm text-zinc-500">Latest 50 submissions</p>
        </div>
        <span className="text-sm text-zinc-500">
          Total: {requests?.length || 0}
        </span>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="rounded-md border bg-white p-12 text-center">
          <p className="text-zinc-600">No water service requests yet.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to public form →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-white">
          <table className="w-full table-auto text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Service Window</th>
                <th className="p-3">Property</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="flex flex-col gap-1 hover:underline"
                    >
                      <span className="font-medium text-zinc-900">{req.applicant_name}</span>
                      <span className="text-xs uppercase tracking-wide text-zinc-500">
                        {req.property_use_type?.replace("_", " ")}
                      </span>
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs">
                      <span>{req.applicant_email || "—"}</span>
                      <span className="text-zinc-500">{req.applicant_phone || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs">
                      <span>Start: {req.service_start_date ?? "—"}</span>
                      <span>Stop: {req.service_stop_date ?? "—"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">
                      <div>{req.service_address || "—"}</div>
                      <div className="text-zinc-500">
                        {req.service_city || req.service_state
                          ? `${req.service_city ?? ""}${req.service_city && req.service_state ? ", " : ""}${req.service_state ?? ""}`
                          : ""}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <form action={async (formData: FormData) => {
                      "use server";
                      const id = String(formData.get("id"));
                      const status = String(formData.get("status"));
                      await updateRequestStatus(id, status);
                    }}>
                      <input type="hidden" name="id" value={req.id} />
                      <select
                        name="status"
                        defaultValue={req.status}
                        className="rounded border px-2 py-1 text-xs"
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      >
                        <option value="new">New</option>
                        <option value="pending_documents">Pending Documents</option>
                        <option value="pending_landlord_verification">Pending Landlord</option>
                        <option value="pending_credit_check">Pending Credit</option>
                        <option value="pending_deposit">Pending Deposit</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled_activation">Scheduled</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="rounded border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteRequest(req.id);
                      }}>
                        <button className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
