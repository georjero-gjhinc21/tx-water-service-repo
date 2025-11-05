# Comprehensive Validation Guide

## Overview

This application implements **production-grade field validation** for all 52 form fields with real-time feedback, proper formatting, and security measures.

---

## Validation Standards by Field Type

### 📞 **Phone Numbers**

**Standard:** US 10-digit phone numbers

**Validation Rules:**
- ✅ Exactly 10 digits (area code + 7 digits)
- ✅ Area code cannot start with 0 or 1
- ✅ Exchange code (middle 3 digits) cannot start with 0 or 1
- ✅ Automatic formatting: `(555) 123-4567`
- ✅ Strips all non-numeric characters before validation

**Fields:**
- `applicant_phone` (required)
- `applicant_alternate_phone` (optional)
- `applicant_work_phone` (optional)
- `co_applicant_phone` (required if co-applicant)
- `co_applicant_alternate_phone` (optional)
- `co_applicant_work_phone` (optional)
- `landlord_phone` (required if rental property)

**Implementation:**
```typescript
validatePhoneDetailed(phone: string)
formatPhoneInput(value: string) // Auto-formats as (XXX) XXX-XXXX
```

---

### ✉️ **Email Addresses**

**Standard:** RFC 5322 compliant

**Validation Rules:**
- ✅ Valid email format with comprehensive regex
- ✅ Local part max 64 characters
- ✅ Total max 254 characters (RFC 5321)
- ✅ Domain must have valid TLD
- ✅ Detects common typos (gmial.com → gmail.com)
- ✅ Case-insensitive validation

**Fields:**
- `applicant_email` (required)
- `co_applicant_email` (required if co-applicant)

**Common Typo Detection:**
| Typo | Suggestion |
|------|-----------|
| gmial.com | gmail.com |
| gmai.com | gmail.com |
| yahooo.com | yahoo.com |
| hotmial.com | hotmail.com |

**Implementation:**
```typescript
validateEmailDetailed(email: string)
```

---

### 🔢 **Social Security Numbers (SSN)**

**Standard:** 9-digit US SSN with strict validation

**Validation Rules:**
- ✅ Exactly 9 digits
- ✅ Cannot be all same digit (e.g., 111-11-1111)
- ✅ Area number (first 3) cannot be:
  - 000
  - 666
  - 900-999
- ✅ Group number (middle 2) cannot be 00
- ✅ Serial number (last 4) cannot be 0000
- ✅ Automatic formatting: `XXX-XX-XXXX`
- ✅ Displayed as password field (masked input)
- ✅ Only last 4 digits stored in database
- ✅ Full SSN encrypted before storage

**Fields:**
- `applicant_ssn` (optional)
- `co_applicant_ssn` (optional)

**Security:**
- Input type: `password` (hidden while typing)
- Storage: Only last 4 digits in plaintext
- Encryption: Full SSN encrypted with `pgp_sym_encrypt` in database

**Implementation:**
```typescript
validateSSNDetailed(ssn: string)
formatSSNInput(value: string) // Auto-formats as XXX-XX-XXXX
getSSNLast4(ssn: string) // Extract last 4 for storage
```

---

### 🪪 **Driver's License Numbers**

**Standard:** State-specific formats

**Validation Rules:**

#### **Texas (TX)** - Primary Focus
- ✅ Exactly 8 digits
- ✅ Format: `12345678`

#### **Other States:**
| State | Format | Example |
|-------|--------|---------|
| California (CA) | 1 letter + 7 digits | A1234567 |
| Florida (FL) | 1 letter + 12 digits | A123456789012 |
| New York (NY) | 9 digits OR 1 letter + 18 digits | 123456789 |
| Generic | 5-20 alphanumeric characters | - |

**Validation:**
- ✅ Automatically validates against state-specific format
- ✅ Converts to uppercase
- ✅ Alphanumeric only (letters + numbers)
- ✅ Provides specific error messages per state

**Fields:**
- `applicant_drivers_license_number` (optional)
- `applicant_drivers_license_state` (optional, used for validation)
- `co_applicant_drivers_license_number` (optional)
- `co_applicant_drivers_license_state` (optional)

**Implementation:**
```typescript
validateDriversLicense(dlNumber: string, state?: string)
// Returns: { valid: boolean; message?: string }
```

---

### 📮 **Postal Codes (ZIP)**

**Standard:** US ZIP codes

**Validation Rules:**
- ✅ 5 digits (standard): `75001`
- ✅ 9 digits (ZIP+4): `75001-1234`
- ✅ Automatic formatting for ZIP+4
- ✅ Numeric only

**Fields:**
- `service_postal_code` (optional)
- `mailing_postal_code` (optional)

**Implementation:**
```typescript
validatePostalCodeDetailed(zip: string)
formatZipCodeInput(value: string) // Auto-formats as XXXXX-XXXX
```

---

### 🏛️ **State Codes**

**Standard:** US state abbreviations

**Validation Rules:**
- ✅ Exactly 2 letters
- ✅ Must be valid US state or DC
- ✅ Case-insensitive (converts to uppercase)
- ✅ Validates against complete list of 50 states + DC

**Fields:**
- `service_state` (optional)
- `mailing_state` (optional)
- `applicant_drivers_license_state` (optional)
- `co_applicant_drivers_license_state` (optional)

**Valid States:**
```
AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA,
ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK,
OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY, DC
```

**Implementation:**
```typescript
validateStateCode(state: string)
```

---

### 👤 **Names**

**Standard:** Human name validation

**Validation Rules:**
- ✅ Minimum 2 characters
- ✅ Maximum 160 characters
- ✅ Must contain at least one letter
- ✅ Cannot be all numbers
- ✅ Allows spaces, hyphens, apostrophes

**Fields:**
- `applicant_name` (required)
- `co_applicant_name` (required if co-applicant)
- `landlord_name` (required if rental)

**Implementation:**
```typescript
validateName(name: string)
```

---

### 🏠 **Addresses**

**Standard:** US street addresses

**Validation Rules:**
- ✅ Minimum 5 characters
- ✅ Maximum 240 characters
- ✅ Must contain at least one number (street number)
- ✅ Allows letters, numbers, spaces, common punctuation

**Fields:**
- `service_address` (required)
- `mailing_address` (required if different from service)

**Implementation:**
```typescript
validateAddress(address: string)
```

---

### 📅 **Dates**

#### **Date of Birth**

**Validation Rules:**
- ✅ Must be valid date format
- ✅ Cannot be in the future
- ✅ Applicant must be 18+ years old
- ✅ Cannot be more than 120 years ago (reasonable limit)
- ✅ Calculates exact age accounting for month/day

**Fields:**
- `applicant_date_of_birth` (optional)
- `co_applicant_date_of_birth` (optional)

**Implementation:**
```typescript
validateDOBString(dobString: string)
validateDOB(dob: Date) // Returns age validation result
```

#### **Service Dates**

**Validation Rules:**
- ✅ Must be valid date format
- ✅ Can be in past or future
- ✅ Cannot be more than 1 year in future
- ✅ Stop date must be after start date

**Fields:**
- `service_start_date` (optional)
- `service_stop_date` (optional)

**Implementation:**
```typescript
validateServiceDate(dateString: string)
validateDateRange(startDate: Date, endDate: Date)
```

---

### 📁 **File Uploads**

**Standard:** Document uploads with security

**Validation Rules:**
- ✅ Max file size: 10MB (configurable)
- ✅ Allowed types:
  - PDF: `application/pdf`
  - JPEG: `image/jpeg`
  - PNG: `image/png`
  - HEIC: `image/heic`
- ✅ File type verification (MIME type check)
- ✅ File size displayed to user
- ✅ Success indicator after upload

**Fields:**
- `lease_document` (required if rental)
- `deed_document` (required if owner)

**Implementation:**
```typescript
validateFileUpload(file: File, maxSizeMB?: number, allowedTypes?: string[])
```

---

### 🔢 **Numbers**

#### **Cart Counts**

**Validation Rules:**
- ✅ Integer only
- ✅ Range: 0-10
- ✅ Cannot be negative
- ✅ Cannot have decimals

**Fields:**
- `trash_carts_needed` (required, default: 1)
- `recycle_carts_needed` (required, default: 1)

**Implementation:**
```typescript
validateCartCount(count: number)
```

---

## Client-Side Validation

### **Real-Time Validation Components**

Pre-built components with automatic validation:

```tsx
import { PhoneInput, EmailInput, SSNInput, ZipCodeInput } from '@/app/components/ValidatedInput';

// Phone Input with auto-formatting and validation
<PhoneInput
  label="Phone Number"
  value={phone}
  onChange={setPhone}
  required
/>

// Email Input with typo detection
<EmailInput
  label="Email Address"
  value={email}
  onChange={setEmail}
  required
/>

// SSN Input with formatting and security
<SSNInput
  label="Social Security Number"
  value={ssn}
  onChange={setSSn}
/>

// ZIP Code Input with auto-formatting
<ZipCodeInput
  label="ZIP Code"
  value={zip}
  onChange={setZip}
/>
```

### **Visual Feedback**

- ✅ **Green checkmark**: Valid input
- ❌ **Red border**: Invalid input
- 💡 **Help text**: Format guidance
- ⚠️ **Error message**: Specific validation failure
- 🔄 **Auto-formatting**: While typing (phone, SSN, ZIP)

---

## Server-Side Validation

### **Zod Schema** (`types/water-service-request.ts`)

All validations are enforced server-side using Zod:

```typescript
export const WaterServiceRequestSchema = z.object({
  applicant_phone: z.string().min(10).max(20),
  applicant_email: z.string().email().max(160),
  applicant_ssn: z.string().length(11).optional(), // Format: XXX-XX-XXXX
  // ... all 52 fields validated
}).superRefine((data, ctx) => {
  // Complex validation logic
  // - Landlord required for rentals
  // - Co-applicant field dependencies
  // - Mailing address conditional validation
});
```

### **Server Action Validation**

File: `app/actions/submitWaterServiceRequest.ts`

```typescript
export async function submitWaterServiceRequest(formData: FormData) {
  // 1. Parse form data
  // 2. Validate with Zod schema
  // 3. Additional business rule validation
  // 4. Sanitize inputs
  // 5. Process & store
}
```

---

## Security Measures

### **Input Sanitization**

```typescript
sanitizeInput(input: string)
```

- Removes `<` and `>` characters
- Strips `javascript:` protocol
- Limits length to 500 characters
- Trims whitespace

### **SSN Protection**

1. **Input**: Password field (masked)
2. **Transmission**: HTTPS only
3. **Storage**:
   - Last 4 digits in plaintext
   - Full SSN encrypted with PostgreSQL `pgp_sym_encrypt`
4. **Display**: Never shown (only last 4)

### **File Upload Security**

- MIME type validation
- File size limits
- Secure storage in Supabase
- Access control via RLS (Row Level Security)

---

## Error Messages

### **User-Friendly Messages**

All validation provides clear, actionable feedback:

| Validation | Error Message |
|------------|---------------|
| Phone too short | "Phone number must be 10 digits" |
| Phone area code | "Area code cannot start with 0 or 1" |
| Email typo | "Did you mean gmail.com?" |
| SSN invalid | "SSN cannot start with 666" |
| Texas DL | "Texas DL must be 8 digits" |
| Name too short | "Name must be at least 2 characters" |
| Address missing number | "Address must include a street number" |
| Age requirement | "Applicant must be at least 18 years old" |

---

## Usage Example

### **Complete Form Field with Validation**

```tsx
<PhoneInput
  label="Primary Phone Number"
  value={applicantPhone}
  onChange={setApplicantPhone}
  required
/>
```

**Features:**
- ✅ Auto-formats as user types: `5551234567` → `(555) 123-4567`
- ✅ Validates on blur (when user leaves field)
- ✅ Shows green checkmark when valid
- ✅ Shows red border + error message when invalid
- ✅ Displays help text: "10-digit US phone number"
- ✅ Enforces max length (14 characters with formatting)

---

## Testing Validation

### **Valid Test Data**

```javascript
// Phone
"(555) 123-4567"  ✅
"5551234567"      ✅ (auto-formats)

// Email
"john.doe@gmail.com"  ✅
"test+tag@example.co.uk"  ✅

// SSN
"123-45-6789"  ✅
"123456789"    ✅ (auto-formats)

// Texas Driver's License
"12345678"  ✅

// ZIP Code
"75001"        ✅
"75001-1234"   ✅
```

### **Invalid Test Data**

```javascript
// Phone
"(055) 123-4567"  ❌ Area code starts with 0
"555-1234"        ❌ Too short

// Email
"notanemail"      ❌ Missing @ and domain
"test@gmial.com"  ❌ Did you mean gmail.com?

// SSN
"000-12-3456"  ❌ Cannot start with 000
"666-12-3456"  ❌ Cannot start with 666
"123-00-4567"  ❌ Group number cannot be 00

// Texas DL
"1234567"   ❌ Must be 8 digits
"ABCD1234"  ❌ Must be all digits for TX
```

---

## Summary

This validation system provides:

✅ **52 fields** fully validated
✅ **Real-time feedback** with visual indicators
✅ **Auto-formatting** for phone, SSN, ZIP codes
✅ **State-specific** driver's license validation
✅ **Security** measures for sensitive data
✅ **User-friendly** error messages
✅ **RFC compliant** email validation
✅ **Industry standard** SSN validation
✅ **Client & server** validation (defense in depth)
✅ **Production-ready** with comprehensive testing

---

**Status**: ✅ Complete and production-ready
**Last Updated**: November 4, 2025
