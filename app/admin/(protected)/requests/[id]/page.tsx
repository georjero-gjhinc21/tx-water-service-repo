import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient();

  const { data: request } = await supabase
    .from("water_service_requests")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Request Details</h1>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">
          {request.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Name:</span>
              <div className="font-medium">{request.applicant_name}</div>
            </div>
            <div>
              <span className="text-zinc-500">Email:</span>
              <div className="font-medium">{request.applicant_email || "—"}</div>
            </div>
            <div>
              <span className="text-zinc-500">Phone:</span>
              <div className="font-medium">{request.applicant_phone || "—"}</div>
            </div>
            {request.applicant_alternate_phone && (
              <div>
                <span className="text-zinc-500">Alternate Phone:</span>
                <div className="font-medium">{request.applicant_alternate_phone}</div>
              </div>
            )}
            {request.applicant_work_phone && (
              <div>
                <span className="text-zinc-500">Work Phone:</span>
                <div className="font-medium">{request.applicant_work_phone}</div>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Bill Preference:</span>
              <div className="font-medium">{request.bill_type_preference || "—"}</div>
            </div>
          </div>
        </div>

        {/* Service Address */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Service Address</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Street:</span>
              <div className="font-medium">{request.service_address}</div>
            </div>
            <div>
              <span className="text-zinc-500">City, State, ZIP:</span>
              <div className="font-medium">
                {[request.service_city, request.service_state, request.service_postal_code]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </div>
            </div>
            {!request.mailing_address_same_as_service && (
              <>
                <div className="border-t pt-3 mt-3">
                  <span className="text-zinc-500 font-medium">Mailing Address (Different):</span>
                </div>
                <div>
                  <div className="font-medium">{request.mailing_address || "—"}</div>
                  <div className="font-medium text-zinc-600">
                    {[request.mailing_city, request.mailing_state, request.mailing_postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Property Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Property Use:</span>
              <div className="font-medium capitalize">{request.property_use_type?.replace("_", " ")}</div>
            </div>
            {request.landlord_name && (
              <>
                <div>
                  <span className="text-zinc-500">Landlord Name:</span>
                  <div className="font-medium">{request.landlord_name}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Landlord Phone:</span>
                  <div className="font-medium">{request.landlord_phone || "—"}</div>
                </div>
              </>
            )}
            <div>
              <span className="text-zinc-500">Service Territory:</span>
              <div className="font-medium capitalize">{request.service_territory?.replace("_", " ") || "—"}</div>
            </div>
            <div>
              <span className="text-zinc-500">Features:</span>
              <div className="font-medium">
                {request.has_pool && "🏊 Pool "}
                {request.has_sprinkler_system && "💧 Sprinkler "}
                {!request.has_pool && !request.has_sprinkler_system && "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Service Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Start Date:</span>
              <div className="font-medium">{request.service_start_date || "—"}</div>
            </div>
            <div>
              <span className="text-zinc-500">Stop Date:</span>
              <div className="font-medium">{request.service_stop_date || "—"}</div>
            </div>
            <div>
              <span className="text-zinc-500">Trash Carts:</span>
              <div className="font-medium">{request.trash_carts_needed}</div>
            </div>
            <div>
              <span className="text-zinc-500">Recycle Carts:</span>
              <div className="font-medium">{request.recycle_carts_needed}</div>
            </div>
            {request.deposit_amount_required && (
              <div>
                <span className="text-zinc-500">Deposit Required:</span>
                <div className="font-medium">${request.deposit_amount_required.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Co-Applicant (if exists) */}
        {request.has_co_applicant && (
          <div className="rounded-lg border bg-white p-6 md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Co-Applicant Information</h2>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <span className="text-zinc-500">Name:</span>
                <div className="font-medium">{request.co_applicant_name || "—"}</div>
              </div>
              <div>
                <span className="text-zinc-500">Email:</span>
                <div className="font-medium">{request.co_applicant_email || "—"}</div>
              </div>
              <div>
                <span className="text-zinc-500">Phone:</span>
                <div className="font-medium">{request.co_applicant_phone || "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="rounded-lg border bg-white p-6 md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Documents</h2>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-zinc-500">Lease Document:</span>
              <div className="font-medium">
                {request.lease_document_original_name ? (
                  <a href="#" className="text-blue-600 hover:underline">
                    {request.lease_document_original_name}
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Deed Document:</span>
              <div className="font-medium">
                {request.deed_document_original_name ? (
                  <a href="#" className="text-blue-600 hover:underline">
                    {request.deed_document_original_name}
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-lg border bg-zinc-50 p-6 text-xs text-zinc-600 md:col-span-2">
          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <span className="font-medium">Request ID:</span> {request.id}
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(request.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(request.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
