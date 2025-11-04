# Texas Water Service Request - Business Rules & Calculation Logic

## Document Purpose
This document defines all business rules, calculations, and decision trees for the Texas Municipal Water Service Request system. These rules must be implemented in code to ensure accurate processing.

---

## 1. PROPERTY USE TYPE RULES

### 1.1 Property Classification

```typescript
enum PropertyUseType {
  RENT = 'rent',                    // Tenant renting from landlord
  OWNER_OCCUPIED = 'owner_occupied', // Owner living in property
  OWNER_LEASING = 'owner_leasing'    // Owner renting to tenants
}
```

### 1.2 Required Documentation by Property Type

```
IF property_use_type = 'rent':
  REQUIRE:
    - lease_document (PDF or image)
    - landlord_name
    - landlord_phone
    - landlord_verification (before activation)
  OPTIONAL:
    - deed_document

ELSE IF property_use_type = 'owner_occupied' OR 'owner_leasing':
  REQUIRE:
    - deed_document (PDF or image)
  NOT REQUIRED:
    - landlord information
```

### 1.3 Landlord Verification Process

```
IF property_use_type = 'rent':
  1. Capture landlord name and phone
  2. Set status = 'pending_landlord_verification'
  3. Send verification request:
     METHOD: Phone call or automated SMS
     VERIFY:
       - Landlord confirms lease exists
       - Landlord confirms tenant name matches
       - Landlord confirms property address
  4. IF verified:
       - Set landlord_verified = true
       - Set landlord_verification_date = NOW()
       - Advance to next status
     ELSE:
       - Set status = 'cancelled'
       - Notify applicant: "Unable to verify lease with landlord"
```

---

## 2. DEPOSIT CALCULATION RULES

### 2.1 Base Deposit by Property Use Type

```typescript
function getBaseDeposit(propertyUseType: PropertyUseType): number {
  const BASE_DEPOSITS = {
    'rent': 200,            // Highest risk
    'owner_occupied': 75,    // Lowest risk
    'owner_leasing': 125     // Medium risk
  };
  return BASE_DEPOSITS[propertyUseType];
}
```

### 2.2 Service Territory Adjustment

```typescript
function getTerritoryAdjustment(territory: ServiceTerritory): number {
  if (territory === 'outside_city_limits') {
    return 50; // Additional $50 for outside city limits
  }
  return 0;
}
```

### 2.3 Credit Score Adjustment

```typescript
function getCreditAdjustment(creditScore: number | null): number {
  if (creditScore === null) {
    return 100; // No credit check = higher deposit
  }
  
  if (creditScore < 600) {
    return 100; // Poor credit
  } else if (creditScore >= 600 && creditScore < 700) {
    return 0; // Fair credit - base deposit
  } else {
    return -25; // Good credit discount
  }
}
```

### 2.4 Complete Deposit Calculation

```typescript
function calculateDeposit(
  propertyUseType: PropertyUseType,
  territory: ServiceTerritory | null,
  creditScore: number | null
): number {
  const baseDeposit = getBaseDeposit(propertyUseType);
  const territoryAdjustment = getTerritoryAdjustment(territory);
  const creditAdjustment = getCreditAdjustment(creditScore);
  
  const totalDeposit = baseDeposit + territoryAdjustment + creditAdjustment;
  
  // Minimum deposit is $50
  return Math.max(50, totalDeposit);
}
```

### 2.5 Deposit Calculation Examples

| Scenario | Property Type | Territory | Credit Score | Calculation | Total |
|----------|--------------|-----------|--------------|-------------|-------|
| Best case | Owner-occupied | Inside | 750 | 75 + 0 - 25 | **$50** (minimum) |
| Typical owner | Owner-occupied | Inside | 650 | 75 + 0 + 0 | **$75** |
| Outside city | Owner-occupied | Outside | 650 | 75 + 50 + 0 | **$125** |
| Rental fair credit | Rent | Inside | 650 | 200 + 0 + 0 | **$200** |
| Rental poor credit | Rent | Inside | 550 | 200 + 0 + 100 | **$300** |
| Worst case | Rent | Outside | No check | 200 + 50 + 100 | **$350** |

---

## 3. MONTHLY RATE CALCULATION RULES

### 3.1 Base Water Rate

```typescript
const BASE_WATER_RATE = 35.00; // per month

function getWaterRate(territory: ServiceTerritory | null): number {
  let rate = BASE_WATER_RATE;
  
  if (territory === 'outside_city_limits') {
    rate += 10; // $10 surcharge for outside city limits
  }
  
  return rate;
}
```

### 3.2 Trash Service Rate

```typescript
const TRASH_BASE_RATE = 15.00;           // First cart included
const ADDITIONAL_TRASH_CART_FEE = 5.00;  // Per additional cart per month

function getTrashRate(cartsNeeded: number): number {
  if (cartsNeeded === 0) {
    return 0; // No trash service
  }
  
  // First cart included in base rate
  const additionalCarts = Math.max(0, cartsNeeded - 1);
  return TRASH_BASE_RATE + (additionalCarts * ADDITIONAL_TRASH_CART_FEE);
}
```

### 3.3 Recycle Service Rate

```typescript
const RECYCLE_BASE_RATE = 8.00;             // First cart included
const ADDITIONAL_RECYCLE_CART_FEE = 3.00;   // Per additional cart per month

function getRecycleRate(cartsNeeded: number): number {
  if (cartsNeeded === 0) {
    return 0; // No recycle service
  }
  
  // First cart included in base rate
  const additionalCarts = Math.max(0, cartsNeeded - 1);
  return RECYCLE_BASE_RATE + (additionalCarts * ADDITIONAL_RECYCLE_CART_FEE);
}
```

### 3.4 Property Features Surcharges

```typescript
const POOL_SURCHARGE = 15.00;              // Per month
const SPRINKLER_NOTE = "Irrigation rates apply based on usage tiers";

function getPropertyFeatureSurcharges(
  hasPool: boolean,
  hasSprinkler: boolean
): { surcharge: number; notes: string[] } {
  let surcharge = 0;
  const notes: string[] = [];
  
  if (hasPool) {
    surcharge += POOL_SURCHARGE;
    notes.push("Pool surcharge: $15/month");
  }
  
  if (hasSprinkler) {
    notes.push(SPRINKLER_NOTE);
    notes.push("Tier 1 (0-5k gallons): Base rate");
    notes.push("Tier 2 (5k-10k gallons): +$0.50/1k gallons");
    notes.push("Tier 3 (10k+ gallons): +$1.00/1k gallons");
  }
  
  return { surcharge, notes };
}
```

### 3.5 Complete Monthly Rate Calculation

```typescript
interface RateBreakdown {
  waterRate: number;
  trashRate: number;
  recycleRate: number;
  poolSurcharge: number;
  subtotal: number;
  estimatedTotal: number;
  notes: string[];
}

function calculateMonthlyRate(
  territory: ServiceTerritory | null,
  trashCarts: number,
  recycleCarts: number,
  hasPool: boolean,
  hasSprinkler: boolean
): RateBreakdown {
  const waterRate = getWaterRate(territory);
  const trashRate = getTrashRate(trashCarts);
  const recycleRate = getRecycleRate(recycleCarts);
  const { surcharge: poolSurcharge, notes } = getPropertyFeatureSurcharges(
    hasPool, 
    hasSprinkler
  );
  
  const subtotal = waterRate + trashRate + recycleRate + poolSurcharge;
  
  // Add note about variable water usage
  const estimatedTotal = subtotal; // Base estimate, actual varies with usage
  notes.unshift(`Base monthly service: $${subtotal.toFixed(2)}`);
  notes.push("Actual bill may vary based on water usage");
  
  return {
    waterRate,
    trashRate,
    recycleRate,
    poolSurcharge,
    subtotal,
    estimatedTotal,
    notes
  };
}
```

### 3.6 Rate Calculation Examples

| Scenario | Territory | Trash | Recycle | Pool | Sprinkler | Calculation | Total |
|----------|-----------|-------|---------|------|-----------|-------------|-------|
| Minimal | Inside | 1 | 1 | No | No | 35+15+8 | **$58** |
| Typical | Inside | 1 | 1 | Yes | Yes | 35+15+8+15 | **$73** |
| Large family | Inside | 2 | 2 | Yes | Yes | 35+20+11+15 | **$81** |
| Outside city | Outside | 1 | 1 | No | No | 45+15+8 | **$68** |
| Max services | Inside | 3 | 2 | Yes | Yes | 35+25+11+15 | **$86** |

---

## 4. CREDIT CHECK RULES

### 4.1 When to Require Credit Check

```
ALWAYS require credit check IF:
  - property_use_type = 'rent'
  - applicant_date_of_birth indicates age < 25
  - No previous service history in system

OPTIONAL credit check IF:
  - property_use_type = 'owner_occupied' OR 'owner_leasing'
  - applicant_date_of_birth indicates age >= 25
  - Can provide references
```

### 4.2 Credit Check Process

```
1. Verify SSN and DOB provided
2. Obtain consent (acknowledged_service_terms includes credit check disclosure)
3. Submit to credit bureau API
4. Store results:
   - credit_check_performed = true
   - credit_check_date = NOW()
   - credit_check_score = [score from API]
   - credit_check_result = 'approved' | 'requires_deposit' | 'denied'
5. Calculate deposit using credit score
6. Update status based on result
```

### 4.3 Credit Check Result Actions

```
IF credit_check_result = 'approved' AND credit_score >= 700:
  - Reduce deposit by $25
  - Set status = 'approved'
  - Send approval email

ELSE IF credit_check_result = 'requires_deposit':
  - Calculate full deposit
  - Set status = 'pending_deposit'
  - Send deposit payment link email

ELSE IF credit_check_result = 'denied':
  - Set status = 'cancelled'
  - Send denial email with appeal instructions
  - Offer alternative: higher deposit option
```

---

## 5. DOCUMENT VALIDATION RULES

### 5.1 Lease Document Requirements

```
IF property_use_type = 'rent':
  REQUIRE lease_document where:
    - File type: PDF, JPG, PNG, or HEIC
    - Max size: 10 MB
    - Must be readable (not corrupted)
    
  LEASE MUST CONTAIN:
    - Landlord name (matches landlord_name field)
    - Tenant name (matches applicant_name)
    - Property address (matches service_address)
    - Lease dates (current or future)
    - Signatures (landlord and tenant)
    
  IF lease missing required elements:
    - Set status = 'pending_documents'
    - Email applicant requesting complete lease
```

### 5.2 Deed Document Requirements

```
IF property_use_type = 'owner_occupied' OR 'owner_leasing':
  REQUIRE deed_document where:
    - File type: PDF, JPG, PNG, or HEIC
    - Max size: 10 MB
    - Must be readable
    
  DEED MUST CONTAIN:
    - Owner name (matches applicant_name)
    - Property address (matches service_address)
    - County recording information
    
  IF deed missing or unclear:
    - Accept tax statement as alternative
    - Or set status = 'pending_documents'
```

### 5.3 Document Processing Workflow

```
1. User uploads document
2. Store in Supabase Storage
3. Generate thumbnail (for images)
4. Extract text (OCR for images, PDF text for PDFs)
5. Verify key information:
   - Names match
   - Address matches
   - Dates are current/valid
6. IF automated verification fails:
   - Flag for manual review
   - Admin reviews in dashboard
   - Admin approves or requests resubmission
```

---

## 6. STATUS WORKFLOW RULES

### 6.1 Status Transitions

```
new (initial)
  ↓
  IF has all required fields → pending_documents
  ELSE → stays 'new', email user about missing info

pending_documents
  ↓
  IF property_use_type = 'rent' → pending_landlord_verification
  ELSE IF owner types → pending_credit_check

pending_landlord_verification
  ↓
  IF landlord_verified = true → pending_credit_check
  ELSE → stays pending, automated reminders every 24h

pending_credit_check
  ↓
  IF credit_check_performed = true:
    IF credit_check_result = 'approved' AND deposit not required → approved
    ELSE IF requires deposit → pending_deposit
    ELSE → cancelled (denied)

pending_deposit
  ↓
  IF deposit_paid = true → approved
  ELSE → stays pending, reminders every 48h for 14 days, then cancelled

approved
  ↓
  Admin schedules activation → scheduled_activation

scheduled_activation
  ↓
  On activation date → active

active
  ↓
  Normal operation, billing begins

suspended
  ↓
  Non-payment or customer request
  Can return to active upon resolution

completed
  ↓
  Service stop date reached, customer moved out
  Final status

cancelled
  ↓
  Application denied or withdrawn
  Final status
```

### 6.2 Automatic Status Updates

```typescript
// Run daily cron job
function updateStatuses() {
  // Auto-cancel old pending deposits
  UPDATE water_service_requests
  SET status = 'cancelled'
  WHERE status = 'pending_deposit'
    AND deposit_paid = false
    AND created_at < NOW() - INTERVAL '14 days';
  
  // Auto-activate scheduled activations
  UPDATE water_service_requests
  SET status = 'active'
  WHERE status = 'scheduled_activation'
    AND meter_activation_scheduled_date <= CURRENT_DATE
    AND meter_activation_completed_date IS NOT NULL;
  
  // Auto-complete expired services
  UPDATE water_service_requests
  SET status = 'completed'
  WHERE status = 'active'
    AND service_stop_date IS NOT NULL
    AND service_stop_date < CURRENT_DATE;
}
```

---

## 7. WORK ORDER GENERATION RULES

### 7.1 Meter Activation Work Order

```
TRIGGER: Status changes to 'approved'

GENERATE work order:
  - meter_activation_work_order_number = generate_wo_number('METER')
  - meter_activation_scheduled_date = service_start_date OR next_available_date
  - Assignment: Field technician
  - Instructions:
    * Turn on meter at [service_address]
    * Verify no leaks
    * Record initial meter reading
    * Leave door hanger with welcome info
    
SCHEDULE:
  - IF service_start_date > 3 days from now:
      Schedule for service_start_date
  - ELSE:
      Schedule for next available slot (typically 1-2 business days)
```

### 7.2 Trash Cart Delivery Work Order

```
TRIGGER: Status changes to 'approved'

IF trash_carts_needed > 0:
  GENERATE work order:
    - trash_delivery_work_order_number = generate_wo_number('TRASH')
    - trash_delivery_scheduled_date = meter_activation_scheduled_date OR before
    - Quantity: trash_carts_needed
    - Assignment: Sanitation department
    - Instructions:
      * Deliver [trash_carts_needed] trash cart(s) to [service_address]
      * Place in visible location
      * Leave service info sticker on cart
```

### 7.3 Recycle Cart Delivery Work Order

```
TRIGGER: Status changes to 'approved'

IF recycle_carts_needed > 0:
  GENERATE work order:
    - recycle_delivery_work_order_number = generate_wo_number('RECYCLE')
    - recycle_delivery_scheduled_date = meter_activation_scheduled_date OR before
    - Quantity: recycle_carts_needed
    - Assignment: Sanitation department
    - Instructions:
      * Deliver [recycle_carts_needed] recycle cart(s) to [service_address]
      * Place next to trash cart(s)
      * Leave recycling guide
```

---

## 8. NOTIFICATION RULES

### 8.1 Email Notifications

```typescript
interface NotificationTriggers {
  'application_received': {
    trigger: 'On form submission',
    recipients: ['applicant_email'],
    template: 'confirmation',
    content: {
      subject: 'Water Service Application Received',
      body: 'Thank you for applying. Reference: [id]'
    }
  },
  
  'pending_documents': {
    trigger: 'Status = pending_documents',
    recipients: ['applicant_email'],
    template: 'documents_needed',
    content: {
      subject: 'Documents Required for Water Service',
      body: 'Please upload: [list required documents]'
    }
  },
  
  'landlord_verification_request': {
    trigger: 'property_use_type = rent',
    recipients: ['landlord (via phone)'],
    method: 'phone_call',
    content: 'Automated call to verify lease'
  },
  
  'credit_check_complete': {
    trigger: 'credit_check_performed = true',
    recipients: ['applicant_email'],
    template: 'credit_result',
    content: 'Based on credit check, deposit required: $[amount]'
  },
  
  'deposit_payment_required': {
    trigger: 'Status = pending_deposit',
    recipients: ['applicant_email'],
    template: 'payment_link',
    content: {
      subject: 'Deposit Payment Required',
      body: 'Click here to pay deposit: [payment_link]',
      cta_button: 'Pay $[amount] Deposit'
    }
  },
  
  'application_approved': {
    trigger: 'Status = approved',
    recipients: ['applicant_email', 'co_applicant_email'],
    template: 'approval',
    content: {
      subject: 'Water Service Approved!',
      body: 'Account #: [account_number], Service starts: [date]'
    }
  },
  
  'activation_scheduled': {
    trigger: 'Status = scheduled_activation',
    recipients: ['applicant_email'],
    template: 'appointment_reminder',
    content: 'Meter activation scheduled for [date]. Please ensure access.'
  },
  
  'service_active': {
    trigger: 'Status = active',
    recipients: ['applicant_email'],
    template: 'welcome',
    content: 'Welcome! Service is now active. First bill: [date]'
  },
  
  'application_cancelled': {
    trigger: 'Status = cancelled',
    recipients: ['applicant_email'],
    template: 'cancellation',
    content: 'Application cancelled. Reason: [reason]. Appeal: [link]'
  }
}
```

### 8.2 Reminder Rules

```
pending_landlord_verification:
  - Send reminder to admin every 24 hours
  - Escalate to supervisor after 3 days
  - Auto-cancel after 7 days if not verified

pending_deposit:
  - Send payment reminder after 2 days
  - Send second reminder after 7 days
  - Send final notice after 12 days
  - Auto-cancel after 14 days

scheduled_activation:
  - Send reminder 2 days before
  - Send reminder day before
  - Send SMS 2 hours before (if opted in)
```

---

## 9. ACCOUNT NUMBER GENERATION RULES

### 9.1 Format

```
Account Number Format: YYYY-NNNNN
  YYYY = Year of approval
  NNNNN = Sequential 5-digit number

Examples:
  2025-00001 (first account of 2025)
  2025-00142
  2025-99999
  2026-00001 (resets each year)
```

### 9.2 Generation Logic

```typescript
function generateAccountNumber(approvalDate: Date): string {
  const year = approvalDate.getFullYear();
  const sequence = getNextSequence(year); // From database sequence
  const paddedSequence = String(sequence).padStart(5, '0');
  return `${year}-${paddedSequence}`;
}

// Database sequence resets each year
CREATE SEQUENCE account_number_seq_2025 START 1;
// Trigger auto-generates on status change to 'approved'
```

---

## 10. CUSTOMER PIN GENERATION RULES

### 10.1 Format

```
PIN Format: 4-6 digit number
  - Must not be sequential (1234, 5678)
  - Must not be repeating (1111, 3333)
  - Should be random
```

### 10.2 Generation Logic

```typescript
function generateCustomerPIN(): string {
  let pin: string;
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000)).substring(0, 6);
  } while (isWeakPIN(pin));
  return pin;
}

function isWeakPIN(pin: string): boolean {
  // Check for all same digit
  if (/^(\d)\1+$/.test(pin)) return true;
  
  // Check for sequential
  const digits = pin.split('').map(Number);
  let sequential = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i-1] + 1) {
      sequential = false;
      break;
    }
  }
  return sequential;
}
```

---

## 11. DATA VALIDATION RULES

### 11.1 Phone Number Validation

```typescript
function validatePhone(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // US phone must be 10 digits
  if (cleaned.length !== 10) return false;
  
  // Area code cannot start with 0 or 1
  if (cleaned[0] === '0' || cleaned[0] === '1') return false;
  
  return true;
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned; // Store as 10 digits: 5551234567
}

function displayPhone(phone: string): string {
  // Display as: (555) 123-4567
  return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
}
```

### 11.2 SSN Validation

```typescript
function validateSSN(ssn: string): boolean {
  // Remove all non-digits
  const cleaned = ssn.replace(/\D/g, '');
  
  // Must be exactly 9 digits
  if (cleaned.length !== 9) return false;
  
  // Cannot be all same digit
  if (/^(\d)\1{8}$/.test(cleaned)) return false;
  
  // Cannot start with 000, 666, or 900-999
  const firstThree = parseInt(cleaned.slice(0, 3));
  if (firstThree === 0 || firstThree === 666 || firstThree >= 900) return false;
  
  return true;
}

function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  return `${cleaned.slice(0,3)}-${cleaned.slice(3,5)}-${cleaned.slice(5)}`;
}

function getSSNLast4(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.slice(-4);
}
```

### 11.3 Date of Birth Validation

```typescript
function validateDOB(dob: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  
  // Must be at least 18 years old
  if (age < 18) return false;
  
  // Cannot be in the future
  if (dob > today) return false;
  
  // Cannot be more than 120 years ago (reasonable limit)
  if (age > 120) return false;
  
  return true;
}
```

### 11.4 Email Validation

```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 11.5 Address Validation

```typescript
interface AddressValidationResult {
  valid: boolean;
  standardized?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  inServiceArea?: boolean;
  territory?: 'inside_city_limits' | 'outside_city_limits';
}

async function validateAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<AddressValidationResult> {
  // 1. Call Google Maps Geocoding API
  // 2. Verify address exists
  // 3. Get standardized format
  // 4. Check if coordinates are within service area polygon
  // 5. Determine inside/outside city limits
  // 6. Return result
}
```

---

## 12. SECURITY & PRIVACY RULES

### 12.1 SSN Encryption

```typescript
// Server-side only
import { createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.SSN_ENCRYPTION_KEY; // 32 bytes

function encryptSSN(ssn: string): Buffer {
  // Use PostgreSQL pgp_sym_encrypt in database
  // Or implement application-level encryption
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  // ... encryption logic
}

function decryptSSN(encrypted: Buffer): string {
  // Decrypt only when absolutely necessary
  // Log all decryption attempts
  // ... decryption logic
}

// NEVER send full SSN to frontend
// NEVER log full SSN
// NEVER include in API responses
```

### 12.2 PII Access Logging

```
Every access to sensitive fields must be logged:
  - Who: user_id
  - What: field_name
  - When: timestamp
  - Why: reason (e.g., "Customer service inquiry")
  - How: access_method (view, export, print)
  
Sensitive fields:
  - applicant_ssn_encrypted
  - co_applicant_ssn_encrypted
  - applicant_date_of_birth
  - co_applicant_date_of_birth
  - credit_check_score
```

### 12.3 Data Retention

```
Active accounts:
  - Retain all data indefinitely

Cancelled applications:
  - Retain for 2 years
  - After 2 years, anonymize PII:
    * Delete SSN (both encrypted and last4)
    * Redact DOB (keep year only)
    * Delete signature images
    * Delete document uploads
    * Keep: address, service dates, financial transactions

Completed accounts (moved out):
  - Retain full data for 7 years (legal requirement)
  - After 7 years, follow same anonymization as cancelled
```

---

## IMPLEMENTATION PRIORITY

### Must Implement for MVP:
1. ✅ Property use type rules
2. ✅ Deposit calculation (basic)
3. ✅ Monthly rate calculation
4. ✅ Document requirements by property type
5. ✅ Status workflow
6. ✅ Basic email notifications

### Phase 2:
7. Credit check integration
8. Landlord verification process
9. Work order generation
10. Address validation
11. Advanced notifications

### Phase 3:
12. SSN encryption
13. PII access logging
14. Data retention automation
15. Advanced security features

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for implementation
