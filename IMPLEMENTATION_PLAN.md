# Water Service Request Form - Implementation Plan

## Executive Summary

This document outlines the plan to implement a complete 52-field water service request form based on the proven formdemo implementation pattern, extended to meet all Texas utility requirements.

---

## Current State vs Target State

### Current (formdemo)
- ✅ 4 steps, 11 fields
- ✅ Progressive field disclosure pattern working
- ✅ Basic validation with Zod
- ✅ Supabase integration
- ✅ File uploads
- ✅ Toast notifications

### Target (tx-water-service-repo)
- 🎯 5 steps, 52 fields
- 🎯 Extended progressive disclosure
- 🎯 Complex conditional logic (landlord, co-applicant, mailing address)
- 🎯 Business rule validation
- 🎯 Rate & deposit calculations
- 🎯 Digital signature capture
- 🎯 Legal acknowledgment

---

## Form Steps Breakdown

### Step 1: Basic Contact Information (8 fields)
**Progressive Disclosure Pattern:**
1. Show: Name, Email, Phone (always visible)
2. After name + email + phone filled → Show: Alternate Phone, Work Phone
3. After basic contact complete → Show: Bill Type Preference

**Fields:**
- applicant_name (text, required)
- applicant_email (email, required) ← **NEW**
- applicant_phone (tel, required)
- applicant_alternate_phone (tel, optional) ← **NEW**
- applicant_work_phone (tel, optional) ← **NEW**
- bill_type_preference (radio: mail/email/both, required) ← **NEW**

### Step 2: Address & Service Dates (12 fields)
**Progressive Disclosure Pattern:**
1. Show: Service Address, City, State, Zip (always visible)
2. After service address complete → Show: "Mailing same as service?" checkbox
3. If "No" checked → Show: Mailing Address fields
4. After addresses complete → Show: Service dates

**Fields:**
- service_address (text, required)
- service_city (text, optional)
- service_state (select, optional)
- service_postal_code (text, optional)
- mailing_address_same_as_service (checkbox, default true) ← **NEW**
- mailing_address (text, conditional) ← **NEW**
- mailing_city (text, conditional) ← **NEW**
- mailing_state (select, conditional) ← **NEW**
- mailing_postal_code (text, conditional) ← **NEW**
- service_request_date (date, auto-filled, readonly) ← **NEW**
- service_start_date (date, optional)
- service_stop_date (date, optional)

### Step 3: Property & Services (11 fields)
**Progressive Disclosure Pattern:**
1. Show: Property use type radio buttons (always visible)
2. If "Rent" selected → Show: Landlord fields
3. After property type → Show: Sanitation services
4. After cart counts → Show: Property features

**Fields:**
- property_use_type (radio: rent/owner_occupied/owner_leasing, required) ← **NEW**
- landlord_name (text, conditional if rent) ← **NEW**
- landlord_phone (tel, conditional if rent) ← **NEW**
- trash_carts_needed (number, default 1, required) ← **NEW**
- recycle_carts_needed (number, default 1, required) ← **NEW**
- has_sprinkler_system (checkbox) ← **NEW**
- has_pool (checkbox) ← **NEW**
- Display: Fee information text ← **NEW**
- Display: Estimated monthly cost (calculated) ← **NEW**
- service_territory (auto-detected or select: inside/outside city limits) ← **NEW**

### Step 4: Identity & Co-Applicant (17 fields)
**Progressive Disclosure Pattern:**
1. Show: Primary applicant ID fields (always visible)
2. After primary ID complete → Show: "Add co-applicant?" checkbox
3. If co-applicant checked → Show: All co-applicant fields
4. After identity → Show: Document uploads

**Primary Applicant Fields:**
- applicant_drivers_license_number (text, optional)
- applicant_drivers_license_state (select, optional) ← **NEW**
- applicant_date_of_birth (date, optional) ← **NEW**
- applicant_ssn (text, masked, optional)

**Co-Applicant Section:** (conditional)
- has_co_applicant (checkbox) ← **NEW**
- co_applicant_name (text, conditional) ← **NEW**
- co_applicant_email (email, conditional) ← **NEW**
- co_applicant_phone (tel, conditional) ← **NEW**
- co_applicant_alternate_phone (tel, conditional) ← **NEW**
- co_applicant_work_phone (tel, conditional) ← **NEW**
- co_applicant_drivers_license_number (text, conditional) ← **NEW**
- co_applicant_drivers_license_state (select, conditional) ← **NEW**
- co_applicant_date_of_birth (date, conditional) ← **NEW**
- co_applicant_ssn (text, masked, conditional) ← **NEW**

**Documents:** (conditional based on property type)
- lease_document (file, required if rent) ← updated logic
- deed_document (file, required if owner) ← updated logic

### Step 5: Review & Signature (4 fields)
**Progressive Disclosure Pattern:**
1. Show: Complete review summary (always visible)
2. Show: Deposit & rate calculations ← **NEW**
3. Show: Legal acknowledgment text (always visible)
4. After review → Show: Signature pad

**Fields:**
- Display: All entered data (summary)
- Display: Calculated deposit amount ← **NEW**
- Display: Estimated monthly rate ← **NEW**
- acknowledged_service_terms (checkbox, required) ← **NEW**
- applicant_signature (signature pad, required) ← **NEW**
- applicant_signature_timestamp (auto-filled) ← **NEW**
- co_applicant_signature (signature pad, conditional if has_co_applicant) ← **NEW**

**Total: 52 fields** (8 + 12 + 11 + 17 + 4)

---

## Technical Implementation

### Phase 1: Form Component Structure (Week 1)

**File:** `/app/page.tsx`

```typescript
// Enhanced multi-step form with progressive disclosure
export function MultiStepForm() {
  const [step, setStep] = useState(1);

  // Step 1 - Basic Contact
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState(""); // NEW
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantAlternatePhone, setApplicantAlternatePhone] = useState(""); // NEW
  const [applicantWorkPhone, setApplicantWorkPhone] = useState(""); // NEW
  const [billTypePreference, setBillTypePreference] = useState<BillTypePreference>("email"); // NEW

  // Step 2 - Address
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [serviceState, setServiceState] = useState("");
  const [servicePostalCode, setServicePostalCode] = useState("");
  const [mailingAddressSameAsService, setMailingAddressSameAsService] = useState(true); // NEW
  const [mailingAddress, setMailingAddress] = useState(""); // NEW
  // ... other mailing fields
  const [serviceStartDate, setServiceStartDate] = useState("");
  const [serviceStopDate, setServiceStopDate] = useState("");

  // Step 3 - Property & Services
  const [propertyUseType, setPropertyUseType] = useState<PropertyUseType | "">("");  // NEW
  const [landlordName, setLandlordName] = useState(""); // NEW
  const [landlordPhone, setLandlordPhone] = useState(""); // NEW
  const [trashCartsNeeded, setTrashCartsNeeded] = useState(1); // NEW
  const [recycleCartsNeeded, setRecycleCartsNeeded] = useState(1); // NEW
  const [hasSprinklerSystem, setHasSprinklerSystem] = useState(false); // NEW
  const [hasPool, setHasPool] = useState(false); // NEW
  const [serviceTerritory, setServiceTerritory] = useState<ServiceTerritory | null>(null); // NEW

  // Step 4 - Identity
  const [applicantDriversLicenseNumber, setApplicantDriversLicenseNumber] = useState("");
  const [applicantDriversLicenseState, setApplicantDriversLicenseState] = useState(""); // NEW
  const [applicantDateOfBirth, setApplicantDateOfBirth] = useState(""); // NEW
  const [applicantSsn, setApplicantSsn] = useState("");
  const [hasCoApplicant, setHasCoApplicant] = useState(false); // NEW
  // ... all co-applicant fields
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null);
  const [deedDocument, setDeedDocument] = useState<File | null>(null);

  // Step 5 - Review & Signature
  const [acknowledgedServiceTerms, setAcknowledgedServiceTerms] = useState(false); // NEW
  const [applicantSignature, setApplicantSignature] = useState<string | null>(null); // NEW
  const [coApplicantSignature, setCoApplicantSignature] = useState<string | null>(null); // NEW

  // Calculated values
  const monthlyRate = useMemo(() =>
    calculateMonthlyRate(
      serviceTerritory,
      trashCartsNeeded,
      recycleCartsNeeded,
      hasPool,
      hasSprinklerSystem
    ),
    [serviceTerritory, trashCartsNeeded, recycleCartsNeeded, hasPool, hasSprinklerSystem]
  );

  const depositAmount = useMemo(() =>
    calculateDeposit(
      propertyUseType,
      serviceTerritory,
      null // credit score (not yet performed)
    ),
    [propertyUseType, serviceTerritory]
  );

  // Progressive disclosure logic
  const showAlternatePhones = applicantName && applicantEmail && applicantPhone;
  const showBillTypePreference = showAlternatePhones;
  const showMailingAddress = !mailingAddressSameAsService;
  const showLandlordFields = propertyUseType === 'rent';
  const showCoApplicantFields = hasCoApplicant;

  // ... validation and submission logic
}
```

### Phase 2: Server Action Updates (Week 1)

**File:** `/app/actions/submitWaterServiceRequest.ts` (NEW)

```typescript
"use server";

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { calculateMonthlyRate, calculateDeposit } from '@/app/lib/calculations';

const WaterServiceRequestSchema = z.object({
  // Step 1
  applicant_name: z.string().min(2).max(160),
  applicant_email: z.string().email().max(160),
  applicant_phone: z.string().min(10).max(20),
  applicant_alternate_phone: z.string().min(10).max(20).optional(),
  applicant_work_phone: z.string().min(10).max(20).optional(),
  bill_type_preference: z.enum(['mail', 'email', 'both']),

  // Step 2
  service_address: z.string().min(4).max(240),
  service_city: z.string().max(120).optional(),
  service_state: z.string().length(2).optional(),
  service_postal_code: z.string().max(20).optional(),
  mailing_address_same_as_service: z.boolean(),
  mailing_address: z.string().min(4).max(240).optional(),
  mailing_city: z.string().max(120).optional(),
  mailing_state: z.string().length(2).optional(),
  mailing_postal_code: z.string().max(20).optional(),
  service_start_date: z.string().optional(),
  service_stop_date: z.string().optional(),

  // Step 3
  property_use_type: z.enum(['rent', 'owner_occupied', 'owner_leasing']),
  landlord_name: z.string().max(160).optional(),
  landlord_phone: z.string().min(10).max(20).optional(),
  trash_carts_needed: z.number().int().min(0).max(10),
  recycle_carts_needed: z.number().int().min(0).max(10),
  has_sprinkler_system: z.boolean(),
  has_pool: z.boolean(),
  service_territory: z.enum(['inside_city_limits', 'outside_city_limits']).nullable(),

  // Step 4
  applicant_drivers_license_number: z.string().max(120).optional(),
  applicant_drivers_license_state: z.string().length(2).optional(),
  applicant_date_of_birth: z.string().optional(),
  applicant_ssn: z.string().optional(),
  has_co_applicant: z.boolean(),
  // ... co-applicant fields

  // Step 5
  acknowledged_service_terms: z.boolean().refine(val => val === true),
}).superRefine((data, ctx) => {
  // Rental property validation
  if (data.property_use_type === 'rent') {
    if (!data.landlord_name || data.landlord_name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['landlord_name'],
        message: "Landlord name is required for rental properties",
      });
    }
    if (!data.landlord_phone || data.landlord_phone.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['landlord_phone'],
        message: "Landlord phone is required for rental properties",
      });
    }
  }

  // Mailing address validation
  if (!data.mailing_address_same_as_service) {
    if (!data.mailing_address || data.mailing_address.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mailing_address'],
        message: "Mailing address is required when different from service address",
      });
    }
  }

  // Co-applicant validation
  if (data.has_co_applicant) {
    // Validate co-applicant required fields
  }
});

export async function submitWaterServiceRequest(formData: FormData) {
  // Parse and validate
  // Handle file uploads
  // Encrypt SSN
  // Calculate deposit & rates
  // Insert to database
  // Return result
}
```

### Phase 3: Type Definitions (Already Complete ✅)

The types are already defined in `/types/water-service-request.ts` and include all 52 fields.

### Phase 4: UI Components (Week 2)

**New Components Needed:**

1. **SignaturePad Component** - Digital signature capture
```typescript
// app/components/SignaturePad.tsx
export function SignaturePad({
  onSave,
  label
}: {
  onSave: (signature: string) => void;
  label: string;
}) {
  // Canvas-based signature implementation
}
```

2. **RateCalculator Display Component**
```typescript
// app/components/RateCalculator.tsx
export function RateCalculatorDisplay({
  calculation
}: {
  calculation: RateCalculation;
}) {
  // Display breakdown of rates
}
```

3. **DepositCalculator Display Component**
```typescript
// app/components/DepositCalculator.tsx
export function DepositCalculatorDisplay({
  amount,
  breakdown
}: {
  amount: number;
  breakdown: string[];
}) {
  // Display deposit calculation
}
```

---

## Database Migration

The schema already exists in `database/schema.sql` with all 52 fields. No changes needed.

---

## Progressive Disclosure Implementation Pattern

**Key Pattern from formdemo** (lines 203-224):
```typescript
{name && phone && (
  <>
    <label>
      <div>Select Requested Date to START Service</div>
      <input type="date" ... />
    </label>
    <label>
      <div>Select Requested Date to STOP Service</div>
      <input type="date" ... />
    </label>
  </>
)}
```

**Extended Pattern for tx-water-service-repo:**

```typescript
// Step 1: Progressive disclosure
{applicantName && applicantEmail && applicantPhone && (
  <>
    <label>Alternate Phone</label>
    <input ... />
    <label>Work Phone</label>
    <input ... />
  </>
)}

{applicantName && applicantEmail && applicantPhone && (
  <div>
    <label>Bill Type Preference</label>
    <RadioGroup ... />
  </div>
)}

// Step 2: Conditional mailing address
{!mailingAddressSameAsService && (
  <>
    <label>Mailing Address</label>
    <input ... />
    {/* other mailing fields */}
  </>
)}

// Step 3: Conditional landlord fields
{propertyUseType === 'rent' && (
  <>
    <label>Landlord Name</label>
    <input ... />
    <label>Landlord Phone</label>
    <input ... />
  </>
)}

// Step 4: Conditional co-applicant
{hasCoApplicant && (
  <section>
    <h3>Co-Applicant Information</h3>
    {/* All co-applicant fields */}
  </section>
)}

// Step 5: Conditional co-applicant signature
{hasCoApplicant && (
  <SignaturePad
    label="Co-Applicant Signature"
    onSave={setCoApplicantSignature}
  />
)}
```

---

## Timeline

### Week 1: Core Implementation
- [Day 1-2] Set up all state variables (52 fields)
- [Day 3-4] Implement Step 1-3 UI with progressive disclosure
- [Day 5] Implement Step 4-5 UI

### Week 2: Features & Validation
- [Day 1-2] Add SignaturePad component
- [Day 3] Implement all validation rules
- [Day 4] Add rate & deposit calculations
- [Day 5] Testing & bug fixes

### Week 3: Polish & Deploy
- [Day 1-2] Review step transitions and UX
- [Day 3] Admin panel updates to show new fields
- [Day 4] Final testing
- [Day 5] Deploy to production

---

## Success Criteria

- ✅ All 52 fields captured
- ✅ Progressive disclosure working smoothly
- ✅ Conditional validation working (landlord, co-applicant, mailing)
- ✅ Rate & deposit calculations accurate
- ✅ Digital signatures captured
- ✅ Legal acknowledgment recorded
- ✅ All data stored in Supabase
- ✅ Admin panel displays all new fields
- ✅ Form completes in < 5 minutes
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.1 AA)

---

## Risk Mitigation

### Risk: Complex state management with 52 fields
**Mitigation:** Consider React Hook Form or Formik if manual state becomes unwieldy

### Risk: Signature component performance
**Mitigation:** Use established library like `react-signature-canvas`

### Risk: File upload size limits
**Mitigation:** Implement client-side compression, show file size limits

---

## Next Immediate Actions

1. ✅ Review this plan
2. Start Phase 1: Create enhanced MultiStepForm component
3. Copy proven patterns from formdemo
4. Extend with all 52 fields
5. Implement progressive disclosure for each section
6. Add signature component
7. Update server action
8. Test thoroughly
9. Deploy

---

**Status:** Ready to implement
**Estimated Total Time:** 2-3 weeks
**Priority:** High
**Dependencies:** formdemo patterns (✅ analyzed)
