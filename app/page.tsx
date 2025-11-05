"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PropertyUseType,
  ServiceTerritory,
  BillTypePreference
} from "@/types/water-service-request";
import { calculateMonthlyRate, calculateDeposit } from "@/app/lib/calculations";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-8 shadow text-neutral-900">
        <h1 className="mb-2 text-3xl font-semibold">Texas Water Service Request</h1>
        <p className="mb-6 text-zinc-600">
          Complete this form to request water, trash, and recycling services.
          Progress through the steps to provide all required information.
        </p>

        <MultiStepForm />
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const percent = useMemo(() => Math.min(100, ((step - 1) / 4) * 100), [step]);
  return (
    <div className="mb-6">
      <div className="h-2 w-full rounded bg-zinc-200">
        <div
          className="h-2 rounded bg-blue-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-zinc-600">Step {step} of 5</div>
    </div>
  );
}

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const toastTimerRef = useRef<number | undefined>(undefined);
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current !== undefined) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = undefined;
    }, 4200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== undefined) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // STEP 1: Basic Contact Information (8 fields)
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantAlternatePhone, setApplicantAlternatePhone] = useState("");
  const [applicantWorkPhone, setApplicantWorkPhone] = useState("");
  const [billTypePreference, setBillTypePreference] = useState<BillTypePreference>("email");

  // STEP 2: Address & Service Dates (12 fields)
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [serviceState, setServiceState] = useState("");
  const [servicePostalCode, setServicePostalCode] = useState("");
  const [mailingAddressSameAsService, setMailingAddressSameAsService] = useState(true);
  const [mailingAddress, setMailingAddress] = useState("");
  const [mailingCity, setMailingCity] = useState("");
  const [mailingState, setMailingState] = useState("");
  const [mailingPostalCode, setMailingPostalCode] = useState("");
  const [serviceStartDate, setServiceStartDate] = useState("");
  const [serviceStopDate, setServiceStopDate] = useState("");

  // STEP 3: Property & Services (11 fields)
  const [propertyUseType, setPropertyUseType] = useState<PropertyUseType | "">("");
  const [landlordName, setLandlordName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [trashCartsNeeded, setTrashCartsNeeded] = useState(1);
  const [recycleCartsNeeded, setRecycleCartsNeeded] = useState(1);
  const [hasSprinklerSystem, setHasSprinklerSystem] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [serviceTerritory, setServiceTerritory] = useState<ServiceTerritory | null>(null);

  // STEP 4: Identity & Co-Applicant (17 fields)
  const [applicantDriversLicenseNumber, setApplicantDriversLicenseNumber] = useState("");
  const [applicantDriversLicenseState, setApplicantDriversLicenseState] = useState("");
  const [applicantDateOfBirth, setApplicantDateOfBirth] = useState("");
  const [applicantSsn, setApplicantSsn] = useState("");
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coApplicantName, setCoApplicantName] = useState("");
  const [coApplicantEmail, setCoApplicantEmail] = useState("");
  const [coApplicantPhone, setCoApplicantPhone] = useState("");
  const [coApplicantAlternatePhone, setCoApplicantAlternatePhone] = useState("");
  const [coApplicantWorkPhone, setCoApplicantWorkPhone] = useState("");
  const [coApplicantDriversLicenseNumber, setCoApplicantDriversLicenseNumber] = useState("");
  const [coApplicantDriversLicenseState, setCoApplicantDriversLicenseState] = useState("");
  const [coApplicantDateOfBirth, setCoApplicantDateOfBirth] = useState("");
  const [coApplicantSsn, setCoApplicantSsn] = useState("");
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null);
  const [deedDocument, setDeedDocument] = useState<File | null>(null);

  // STEP 5: Review & Signature (4 fields)
  const [acknowledgedServiceTerms, setAcknowledgedServiceTerms] = useState(false);
  const [applicantSignature, setApplicantSignature] = useState("");
  const [coApplicantSignature, setCoApplicantSignature] = useState("");

  // Calculated values
  const monthlyRate = useMemo(() => {
    if (!propertyUseType) return null;
    return calculateMonthlyRate(
      serviceTerritory,
      trashCartsNeeded,
      recycleCartsNeeded,
      hasPool,
      hasSprinklerSystem
    );
  }, [serviceTerritory, trashCartsNeeded, recycleCartsNeeded, hasPool, hasSprinklerSystem, propertyUseType]);

  const depositAmount = useMemo(() => {
    if (!propertyUseType) return null;
    return calculateDeposit(
      propertyUseType as PropertyUseType,
      serviceTerritory,
      null // credit score not yet performed
    );
  }, [propertyUseType, serviceTerritory]);

  // Progressive disclosure flags
  const showAlternatePhones = applicantName && applicantEmail && applicantPhone;
  const showBillTypePreference = showAlternatePhones;
  const showMailingAddress = !mailingAddressSameAsService;
  const showLandlordFields = propertyUseType === 'rent';
  const showCoApplicantFields = hasCoApplicant;

  // Validation functions
  function validateStep1() {
    if (!applicantName.trim() || applicantName.length < 2) {
      showToast("error", "Please enter your full name.");
      return false;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes("@")) {
      showToast("error", "Please enter a valid email address.");
      return false;
    }
    const cleanPhone = applicantPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      showToast("error", "Please enter a valid phone number (at least 10 digits).");
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (!serviceAddress.trim() || serviceAddress.length < 5) {
      showToast("error", "Please provide a complete service address.");
      return false;
    }
    if (!mailingAddressSameAsService) {
      if (!mailingAddress.trim() || mailingAddress.length < 5) {
        showToast("error", "Please provide a complete mailing address.");
        return false;
      }
    }
    return true;
  }

  function validateStep3() {
    if (!propertyUseType) {
      showToast("error", "Please select your property use type.");
      return false;
    }
    if (propertyUseType === 'rent') {
      if (!landlordName.trim() || landlordName.length < 2) {
        showToast("error", "Landlord name is required for rental properties.");
        return false;
      }
      const cleanLandlordPhone = landlordPhone.replace(/\D/g, "");
      if (cleanLandlordPhone.length < 10) {
        showToast("error", "Landlord phone number is required for rental properties.");
        return false;
      }
    }
    if (!serviceTerritory) {
      showToast("error", "Please select your service territory.");
      return false;
    }
    return true;
  }

  function validateStep4() {
    if (hasCoApplicant) {
      if (!coApplicantName.trim() || coApplicantName.length < 2) {
        showToast("error", "Co-applicant name is required.");
        return false;
      }
      if (!coApplicantEmail.trim() || !coApplicantEmail.includes("@")) {
        showToast("error", "Co-applicant email is required.");
        return false;
      }
      const cleanCoPhone = coApplicantPhone.replace(/\D/g, "");
      if (cleanCoPhone.length < 10) {
        showToast("error", "Co-applicant phone number is required.");
        return false;
      }
    }
    // Document validation
    if (propertyUseType === 'rent' && !leaseDocument) {
      showToast("error", "Please upload your lease agreement.");
      return false;
    }
    if ((propertyUseType === 'owner_occupied' || propertyUseType === 'owner_leasing') && !deedDocument) {
      showToast("error", "Please upload your property deed.");
      return false;
    }
    return true;
  }

  function handleNext() {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep((s) => Math.min(5, s + 1));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!acknowledgedServiceTerms) {
      showToast("error", "You must acknowledge the service terms to continue.");
      return;
    }
    if (!applicantSignature.trim()) {
      showToast("error", "Please provide your signature.");
      return;
    }
    if (hasCoApplicant && !coApplicantSignature.trim()) {
      showToast("error", "Co-applicant signature is required.");
      return;
    }

    setPending(true);
    try {
      const fd = new FormData();

      // Step 1 fields
      fd.append("applicant_name", applicantName);
      fd.append("applicant_email", applicantEmail);
      fd.append("applicant_phone", applicantPhone);
      fd.append("applicant_alternate_phone", applicantAlternatePhone);
      fd.append("applicant_work_phone", applicantWorkPhone);
      fd.append("bill_type_preference", billTypePreference);

      // Step 2 fields
      fd.append("service_address", serviceAddress);
      fd.append("service_city", serviceCity);
      fd.append("service_state", serviceState);
      fd.append("service_postal_code", servicePostalCode);
      fd.append("mailing_address_same_as_service", mailingAddressSameAsService.toString());
      fd.append("mailing_address", mailingAddress);
      fd.append("mailing_city", mailingCity);
      fd.append("mailing_state", mailingState);
      fd.append("mailing_postal_code", mailingPostalCode);
      fd.append("service_start_date", serviceStartDate);
      fd.append("service_stop_date", serviceStopDate);

      // Step 3 fields
      fd.append("property_use_type", propertyUseType);
      fd.append("landlord_name", landlordName);
      fd.append("landlord_phone", landlordPhone);
      fd.append("trash_carts_needed", trashCartsNeeded.toString());
      fd.append("recycle_carts_needed", recycleCartsNeeded.toString());
      fd.append("has_sprinkler_system", hasSprinklerSystem.toString());
      fd.append("has_pool", hasPool.toString());
      fd.append("service_territory", serviceTerritory || "");

      // Step 4 fields
      fd.append("applicant_drivers_license_number", applicantDriversLicenseNumber);
      fd.append("applicant_drivers_license_state", applicantDriversLicenseState);
      fd.append("applicant_date_of_birth", applicantDateOfBirth);
      fd.append("applicant_ssn", applicantSsn);
      fd.append("has_co_applicant", hasCoApplicant.toString());
      fd.append("co_applicant_name", coApplicantName);
      fd.append("co_applicant_email", coApplicantEmail);
      fd.append("co_applicant_phone", coApplicantPhone);
      fd.append("co_applicant_alternate_phone", coApplicantAlternatePhone);
      fd.append("co_applicant_work_phone", coApplicantWorkPhone);
      fd.append("co_applicant_drivers_license_number", coApplicantDriversLicenseNumber);
      fd.append("co_applicant_drivers_license_state", coApplicantDriversLicenseState);
      fd.append("co_applicant_date_of_birth", coApplicantDateOfBirth);
      fd.append("co_applicant_ssn", coApplicantSsn);
      if (leaseDocument) fd.append("lease_document", leaseDocument);
      if (deedDocument) fd.append("deed_document", deedDocument);

      // Step 5 fields
      fd.append("acknowledged_service_terms", acknowledgedServiceTerms.toString());
      fd.append("applicant_signature", applicantSignature);
      fd.append("co_applicant_signature", coApplicantSignature);

      // For now, just show success
      showToast("success", "Request submitted successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/thanks";
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast("error", "Unexpected error submitting form. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {toast && (
        <div className="fixed right-6 top-6 z-50 flex w-full max-w-sm animate-in fade-in slide-in-from-top rounded-lg border bg-white p-4 text-sm shadow-lg">
          <div
            className={`mr-3 h-2.5 w-2.5 rounded-full mt-1 ${
              toast.type === "success"
                ? "bg-emerald-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          />
          <div className="flex-1 text-zinc-900">{toast.message}</div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-3 text-zinc-400 transition hover:text-zinc-600"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      <ProgressBar step={step} />

      {/* STEP 1: BASIC CONTACT INFORMATION */}
      {step === 1 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Contact Information</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Provide your basic contact details to get started.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block">
              <div className="mb-1 text-sm font-medium">Full Name <span className="text-red-500">*</span></div>
              <input
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </label>

            <label className="sm:col-span-2 block">
              <div className="mb-1 text-sm font-medium">Email Address <span className="text-red-500">*</span></div>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
                required
              />
            </label>

            <label className="sm:col-span-2 block">
              <div className="mb-1 text-sm font-medium">Phone Number <span className="text-red-500">*</span></div>
              <input
                type="tel"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="555-123-4567"
                required
              />
            </label>

            {/* Progressive disclosure: Show after basic contact filled */}
            {showAlternatePhones && (
              <>
                <label className="block">
                  <div className="mb-1 text-sm font-medium">Alternate Phone</div>
                  <input
                    type="tel"
                    value={applicantAlternatePhone}
                    onChange={(e) => setApplicantAlternatePhone(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="555-987-6543"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-sm font-medium">Work Phone</div>
                  <input
                    type="tel"
                    value={applicantWorkPhone}
                    onChange={(e) => setApplicantWorkPhone(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="555-111-2222"
                  />
                </label>
              </>
            )}

            {showBillTypePreference && (
              <div className="sm:col-span-2">
                <div className="mb-2 text-sm font-medium">Bill Delivery Preference <span className="text-red-500">*</span></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billType"
                      value="mail"
                      checked={billTypePreference === "mail"}
                      onChange={() => setBillTypePreference("mail")}
                      className="cursor-pointer"
                    />
                    <span>Mail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billType"
                      value="email"
                      checked={billTypePreference === "email"}
                      onChange={() => setBillTypePreference("email")}
                      className="cursor-pointer"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billType"
                      value="both"
                      checked={billTypePreference === "both"}
                      onChange={() => setBillTypePreference("both")}
                      className="cursor-pointer"
                    />
                    <span>Both</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 2: ADDRESS & SERVICE DATES */}
      {step === 2 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Service Address & Dates</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Where should we provide service, and when would you like to start?
          </p>

          <div className="space-y-6">
            {/* Service Address */}
            <div>
              <h3 className="mb-3 text-md font-medium">Service Address</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 block">
                  <div className="mb-1 text-sm font-medium">Street Address <span className="text-red-500">*</span></div>
                  <input
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-sm font-medium">City</div>
                  <input
                    value={serviceCity}
                    onChange={(e) => setServiceCity(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dallas"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-sm font-medium">State</div>
                  <input
                    value={serviceState}
                    onChange={(e) => setServiceState(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TX"
                    maxLength={2}
                  />
                </label>

                <label className="sm:col-span-2 block">
                  <div className="mb-1 text-sm font-medium">ZIP Code</div>
                  <input
                    value={servicePostalCode}
                    onChange={(e) => setServicePostalCode(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75001"
                  />
                </label>
              </div>
            </div>

            {/* Mailing Address */}
            {serviceAddress && (
              <div>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mailingAddressSameAsService}
                    onChange={(e) => setMailingAddressSameAsService(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">Mailing address same as service address</span>
                </label>

                {showMailingAddress && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4 bg-zinc-50 rounded-md">
                    <label className="sm:col-span-2 block">
                      <div className="mb-1 text-sm font-medium">Mailing Street Address <span className="text-red-500">*</span></div>
                      <input
                        value={mailingAddress}
                        onChange={(e) => setMailingAddress(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="456 Oak Avenue"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">City</div>
                      <input
                        value={mailingCity}
                        onChange={(e) => setMailingCity(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fort Worth"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">State</div>
                      <input
                        value={mailingState}
                        onChange={(e) => setMailingState(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="TX"
                        maxLength={2}
                      />
                    </label>

                    <label className="sm:col-span-2 block">
                      <div className="mb-1 text-sm font-medium">ZIP Code</div>
                      <input
                        value={mailingPostalCode}
                        onChange={(e) => setMailingPostalCode(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="76001"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Service Dates */}
            {serviceAddress && (
              <div>
                <h3 className="mb-3 text-md font-medium">Service Dates</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Requested Start Date</div>
                    <input
                      type="date"
                      value={serviceStartDate}
                      onChange={(e) => setServiceStartDate(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Requested Stop Date (optional)</div>
                    <input
                      type="date"
                      value={serviceStopDate}
                      onChange={(e) => setServiceStopDate(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 3: PROPERTY & SERVICES */}
      {step === 3 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Property & Services</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Tell us about your property and the services you need.
          </p>

          <div className="space-y-6">
            {/* Property Use Type */}
            <div>
              <div className="mb-3 text-sm font-medium">Property Use Type <span className="text-red-500">*</span></div>
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer hover:bg-zinc-50 transition">
                  <input
                    type="radio"
                    name="propertyUseType"
                    value="rent"
                    checked={propertyUseType === "rent"}
                    onChange={() => setPropertyUseType("rent")}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="font-medium">Rent</div>
                    <div className="text-sm text-zinc-600">I am renting this property (landlord information required)</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer hover:bg-zinc-50 transition">
                  <input
                    type="radio"
                    name="propertyUseType"
                    value="owner_occupied"
                    checked={propertyUseType === "owner_occupied"}
                    onChange={() => setPropertyUseType("owner_occupied")}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="font-medium">Owner - Will Occupy</div>
                    <div className="text-sm text-zinc-600">I own this property and will live here</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer hover:bg-zinc-50 transition">
                  <input
                    type="radio"
                    name="propertyUseType"
                    value="owner_leasing"
                    checked={propertyUseType === "owner_leasing"}
                    onChange={() => setPropertyUseType("owner_leasing")}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="font-medium">Owner - Will Lease</div>
                    <div className="text-sm text-zinc-600">I own this property and will rent it to tenants</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Landlord Information */}
            {showLandlordFields && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="mb-3 text-md font-medium">Landlord Information</h3>
                <p className="mb-4 text-sm text-zinc-600">
                  Required for rental properties - for disconnect notices and verification.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Landlord Name <span className="text-red-500">*</span></div>
                    <input
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Property Management Company"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Landlord Phone <span className="text-red-500">*</span></div>
                    <input
                      type="tel"
                      value={landlordPhone}
                      onChange={(e) => setLandlordPhone(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="555-999-8888"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Service Territory */}
            {propertyUseType && (
              <div>
                <div className="mb-3 text-sm font-medium">Service Territory <span className="text-red-500">*</span></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="serviceTerritory"
                      value="inside_city_limits"
                      checked={serviceTerritory === "inside_city_limits"}
                      onChange={() => setServiceTerritory("inside_city_limits")}
                      className="cursor-pointer"
                    />
                    <span>Inside City Limits</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="serviceTerritory"
                      value="outside_city_limits"
                      checked={serviceTerritory === "outside_city_limits"}
                      onChange={() => setServiceTerritory("outside_city_limits")}
                      className="cursor-pointer"
                    />
                    <span>Outside City Limits</span>
                  </label>
                </div>
              </div>
            )}

            {/* Sanitation Services */}
            {propertyUseType && serviceTerritory && (
              <div>
                <h3 className="mb-3 text-md font-medium">Sanitation Services</h3>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900">
                  ℹ️ One (1) trash cart and one (1) recycle cart are included at no additional charge.
                  Additional carts will incur extra monthly fees.
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Number of Trash Carts Needed</div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={trashCartsNeeded}
                      onChange={(e) => setTrashCartsNeeded(parseInt(e.target.value) || 0)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-sm font-medium">Number of Recycle Carts Needed</div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={recycleCartsNeeded}
                      onChange={(e) => setRecycleCartsNeeded(parseInt(e.target.value) || 0)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Property Features */}
            {propertyUseType && serviceTerritory && (
              <div>
                <h3 className="mb-3 text-md font-medium">Property Features</h3>
                <p className="mb-3 text-sm text-zinc-600">
                  Select all that apply - these affect water usage calculations and rates.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSprinklerSystem}
                      onChange={(e) => setHasSprinklerSystem(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Property has sprinkler/irrigation system</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPool}
                      onChange={(e) => setHasPool(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Property has swimming pool</span>
                  </label>
                </div>
              </div>
            )}

            {/* Estimated Monthly Cost */}
            {monthlyRate && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                <h3 className="mb-2 text-md font-medium">Estimated Monthly Cost</h3>
                <div className="text-2xl font-bold text-emerald-700 mb-3">
                  ${monthlyRate.estimated_monthly_total.toFixed(2)}/month
                </div>
                <div className="space-y-1 text-sm text-zinc-700">
                  {monthlyRate.notes.map((note, i) => (
                    <div key={i}>• {note}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Deposit Information */}
            {depositAmount !== null && (
              <div className="p-4 bg-zinc-100 border border-zinc-300 rounded-md">
                <h3 className="mb-2 text-md font-medium">Estimated Deposit</h3>
                <div className="text-2xl font-bold text-zinc-800">
                  ${depositAmount.toFixed(2)}
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Final deposit amount may vary based on credit check results.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 4: IDENTITY & CO-APPLICANT */}
      {step === 4 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Identity Verification & Documents</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Provide identification information for credit check and verification purposes.
          </p>

          <div className="space-y-6">
            {/* Primary Applicant ID */}
            <div>
              <h3 className="mb-3 text-md font-medium">Primary Applicant Identification</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1 text-sm font-medium">Driver's License Number</div>
                  <input
                    value={applicantDriversLicenseNumber}
                    onChange={(e) => setApplicantDriversLicenseNumber(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DL123456789"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-sm font-medium">DL State</div>
                  <input
                    value={applicantDriversLicenseState}
                    onChange={(e) => setApplicantDriversLicenseState(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TX"
                    maxLength={2}
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-sm font-medium">Date of Birth</div>
                  <input
                    type="date"
                    value={applicantDateOfBirth}
                    onChange={(e) => setApplicantDateOfBirth(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-sm font-medium">Social Security Number</div>
                  <input
                    type="password"
                    value={applicantSsn}
                    onChange={(e) => setApplicantSsn(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="***-**-****"
                  />
                </label>
              </div>
            </div>

            {/* Co-Applicant Section */}
            <div className="border-t pt-6">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCoApplicant}
                  onChange={(e) => setHasCoApplicant(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">Add a co-applicant (spouse, roommate, etc.)</span>
              </label>

              {showCoApplicantFields && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-md space-y-4">
                  <h3 className="text-md font-medium">Co-Applicant Information</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2 block">
                      <div className="mb-1 text-sm font-medium">Full Name <span className="text-red-500">*</span></div>
                      <input
                        value={coApplicantName}
                        onChange={(e) => setCoApplicantName(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jane Doe"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Email <span className="text-red-500">*</span></div>
                      <input
                        type="email"
                        value={coApplicantEmail}
                        onChange={(e) => setCoApplicantEmail(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="jane.doe@example.com"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Phone <span className="text-red-500">*</span></div>
                      <input
                        type="tel"
                        value={coApplicantPhone}
                        onChange={(e) => setCoApplicantPhone(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="555-234-5678"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Alternate Phone</div>
                      <input
                        type="tel"
                        value={coApplicantAlternatePhone}
                        onChange={(e) => setCoApplicantAlternatePhone(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="555-876-5432"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Work Phone</div>
                      <input
                        type="tel"
                        value={coApplicantWorkPhone}
                        onChange={(e) => setCoApplicantWorkPhone(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="555-333-4444"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Driver's License Number</div>
                      <input
                        value={coApplicantDriversLicenseNumber}
                        onChange={(e) => setCoApplicantDriversLicenseNumber(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="DL987654321"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">DL State</div>
                      <input
                        value={coApplicantDriversLicenseState}
                        onChange={(e) => setCoApplicantDriversLicenseState(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="TX"
                        maxLength={2}
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Date of Birth</div>
                      <input
                        type="date"
                        value={coApplicantDateOfBirth}
                        onChange={(e) => setCoApplicantDateOfBirth(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-1 text-sm font-medium">Social Security Number</div>
                      <input
                        type="password"
                        value={coApplicantSsn}
                        onChange={(e) => setCoApplicantSsn(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="***-**-****"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Document Uploads */}
            <div>
              <h3 className="mb-3 text-md font-medium">Supporting Documents</h3>

              {propertyUseType === 'rent' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-900">
                  ⚠️ Lease agreement is required for rental properties
                </div>
              )}

              {(propertyUseType === 'owner_occupied' || propertyUseType === 'owner_leasing') && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-900">
                  ⚠️ Property deed is required for owned properties
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1 text-sm font-medium">
                    Lease Agreement {propertyUseType === 'rent' && <span className="text-red-500">*</span>}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setLeaseDocument(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm"
                  />
                  {leaseDocument && (
                    <div className="mt-1 text-xs text-emerald-600">
                      ✓ {leaseDocument.name} ({(leaseDocument.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </label>

                <label className="block">
                  <div className="mb-1 text-sm font-medium">
                    Property Deed {(propertyUseType === 'owner_occupied' || propertyUseType === 'owner_leasing') && <span className="text-red-500">*</span>}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setDeedDocument(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm"
                  />
                  {deedDocument && (
                    <div className="mt-1 text-xs text-emerald-600">
                      ✓ {deedDocument.name} ({(deedDocument.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 5: REVIEW & SIGNATURE */}
      {step === 5 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Review & Submit</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Please review your information carefully before submitting.
          </p>

          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-zinc-50 border rounded-md">
              <h3 className="mb-3 font-medium">Application Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {applicantName}</div>
                <div><strong>Email:</strong> {applicantEmail}</div>
                <div><strong>Phone:</strong> {applicantPhone}</div>
                <div><strong>Service Address:</strong> {serviceAddress}, {serviceCity} {serviceState} {servicePostalCode}</div>
                {!mailingAddressSameAsService && (
                  <div><strong>Mailing Address:</strong> {mailingAddress}, {mailingCity} {mailingState} {mailingPostalCode}</div>
                )}
                <div><strong>Property Type:</strong> {propertyUseType?.replace('_', ' ')}</div>
                {showLandlordFields && <div><strong>Landlord:</strong> {landlordName} ({landlordPhone})</div>}
                <div><strong>Service Territory:</strong> {serviceTerritory?.replace('_', ' ')}</div>
                <div><strong>Trash Carts:</strong> {trashCartsNeeded} | <strong>Recycle Carts:</strong> {recycleCartsNeeded}</div>
                {hasSprinklerSystem && <div>✓ Has sprinkler system</div>}
                {hasPool && <div>✓ Has pool</div>}
                {hasCoApplicant && <div><strong>Co-Applicant:</strong> {coApplicantName}</div>}
              </div>
            </div>

            {/* Cost Summary */}
            {monthlyRate && depositAmount !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="mb-3 font-medium">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Estimated Monthly Cost:</span>
                    <span className="font-bold">${monthlyRate.estimated_monthly_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Deposit:</span>
                    <span className="font-bold">${depositAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Acknowledgment */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="mb-3 font-medium">Service Agreement</h3>
              <p className="text-sm text-zinc-700 mb-4">
                I acknowledge water service will be turned on at the above property. I will not hold the City responsible
                for any property damage due to the water being turned on without my presence. I acknowledge if the meter
                shows use of water while the bill is in my name and my presence is or was required for connection of service.
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedServiceTerms}
                  onChange={(e) => setAcknowledgedServiceTerms(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <span className="text-sm">
                  I have read and agree to the service terms and conditions <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Signature Section */}
            <div className="p-4 border rounded-md">
              <h3 className="mb-3 font-medium">Signature</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Type your full name as your electronic signature
              </p>
              <label className="block mb-4">
                <div className="mb-1 text-sm font-medium">Applicant Signature <span className="text-red-500">*</span></div>
                <input
                  value={applicantSignature}
                  onChange={(e) => setApplicantSignature(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-serif text-lg"
                  placeholder="Type your full name"
                />
              </label>

              {hasCoApplicant && (
                <label className="block">
                  <div className="mb-1 text-sm font-medium">Co-Applicant Signature <span className="text-red-500">*</span></div>
                  <input
                    value={coApplicantSignature}
                    onChange={(e) => setCoApplicantSignature(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-serif text-lg"
                    placeholder="Type co-applicant's full name"
                  />
                </label>
              )}

              <p className="mt-3 text-xs text-zinc-500">
                By typing your name above, you agree that this constitutes a legal electronic signature.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md px-6 py-2 text-zinc-700 hover:bg-zinc-100 transition"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {step < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
            >
              Next →
            </button>
          )}

          {step === 5 && (
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {pending ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
