# Texas Water Service Request Form - Complete Field Analysis

## Document Overview
This form is a **Municipal Utility Service Request Form** used by cities and counties in Texas for establishing water, trash, and recycling services at residential or commercial properties.

---

## SECTION 1: APPLICANT INFORMATION

### Primary Applicant Fields

| Field | Current Status | Usage in TX Counties | Implementation Notes |
|-------|---------------|---------------------|---------------------|
| **Name** | ✅ Implemented | Required by all TX utilities | Stored as `name` (text, required) |
| **Service Address** | ✅ Partial | Required - physical location of service | Currently stored as `property_address`, but form has it separate from mailing |
| **Mailing Address (if different)** | ❌ Missing | Optional - for billing | Not currently captured in database |
| **DL# (Driver's License)** | ✅ Implemented | Required in most TX cities | Stored as `drivers_license_number` |
| **State** | ✅ Implemented | For DL verification | Stored as `property_state` (currently conflated with service address state) |
| **Date of Birth** | ❌ Missing | Required for credit check/ID verification | Not in current schema |
| **Social Security #** | ✅ Partial | Required for credit checks | Only last 4 digits stored (`ssn_last4`), has encrypted field but not used |
| **Cell #** | ✅ Implemented | Primary contact | Stored as `phone` |
| **Alternate #** | ❌ Missing | Secondary contact | Not captured |
| **Work #** | ❌ Missing | Additional contact | Not captured |
| **Email** | ❌ Missing | For e-billing and notifications | Not captured (critical omission) |
| **Bill Type** | ❌ Missing | Delivery preference (Mail/Email/Both) | Not captured |

### Co-Applicant Fields

| Field | Current Status | Usage | Notes |
|-------|---------------|-------|-------|
| **Co-Applicant Name** | ✅ Implemented | Joint account holders (spouses, roommates) | Uses `applicant_type` enum |
| **Co-Applicant Cell #** | ❌ Missing | Secondary contact | Not captured |
| **Co-Applicant DL#** | ❌ Missing | Both parties verification | Not captured |
| **Co-Applicant State** | ❌ Missing | DL verification | Not captured |
| **Co-Applicant Date of Birth** | ❌ Missing | Credit check/verification | Not captured |
| **Co-Applicant Social Security #** | ❌ Missing | Credit check | Not captured |
| **Co-Applicant Email** | ❌ Missing | Notifications | Not captured |

**Issue**: Current implementation treats co-applicant as a type rather than capturing separate co-applicant details.

---

## SECTION 2: PROPERTY USE & OWNERSHIP

### Property Classification

| Field | Current Status | Purpose | TX County Usage |
|-------|---------------|---------|-----------------|
| **Rent (with Landlord info required)** | ❌ Missing | Determines deposit requirements | Used for tenant screening, requires landlord verification |
| **Landlord's Name** | ❌ Missing | Required for rental verification | For disconnect notices |
| **Landlord's Phone #** | ❌ Missing | Emergency contact | Required by most utilities |
| **Owner - Will occupy the home** | ❌ Missing | Owner-occupied status | Lower deposit usually |
| **Owner - Will be leasing** | ❌ Missing | Landlord/investor status | May require different deposit |

**Critical Missing Feature**: Property ownership type directly affects:
- Deposit amounts
- Credit check requirements
- Documentation needed
- Billing responsibility

---

## SECTION 3: SANITATION SERVICES

### Trash & Recycling

| Field | Current Status | Purpose | Implementation Impact |
|-------|---------------|---------|----------------------|
| **Number of Trash Carts Needed** | ❌ Missing | Service level determination | Affects monthly billing |
| **Number of Recycle Carts Needed** | ❌ Missing | Recycling service enrollment | Additional fee calculation |
| **Note about cart provision** | ❌ Missing | Fee disclosure | One cart included, additional cost extra |

**Business Rule**: "Please note one (1) trash and recycle cart is provided with the account at no additional charge. If you require an additional trash or recycle cart(s) an additional fee per container will be added to your monthly bill."

### Additional Property Features

| Field | Current Status | Impact on Service |
|-------|---------------|-------------------|
| **Sprinkler System** | ❌ Missing | Affects water usage tier/rates |
| **Pool** | ❌ Missing | Higher base usage calculations |
| **None** | ❌ Missing | Standard residential rate |

---

## SECTION 4: SERVICE DATES & AGREEMENT

| Field | Current Status | Purpose |
|-------|---------------|---------|
| **Service Request Date** | ❌ Missing | When form submitted (distinct from start date) |
| **Service Start Date** | ✅ Implemented | When to begin service (`service_start_date`) |
| **Service Stop Date** | ✅ Implemented | For temporary/move-out (`service_stop_date`) |
| **Acknowledgment Text** | ❌ Missing | Legal agreement about water shutoff liability |
| **Signature of Applicant** | ❌ Missing | Legal binding signature |
| **Date (for applicant signature)** | ❌ Missing | When form was signed |
| **Signature of Co-Applicant** | ❌ Missing | Joint agreement |
| **Date (for co-applicant signature)** | ❌ Missing | Co-applicant sign date |

**Legal Text on Form**:
> "I acknowledge water service will be turned on at the above property. I will not hold the City of Royse City responsible for any property damage due to the water being turned on without my presence. I acknowledge if the meter shows use of water while the bill is in my name and my presence is or was required for connection of service."

---

## SECTION 5: OFFICE USE ONLY (Administrative Backend)

### Account Management Fields

| Field | Current Status | Purpose | When Used |
|-------|---------------|---------|-----------|
| **Account #** | ❌ Missing | System-generated account number | After approval |
| **Pin #** | ❌ Missing | Customer service verification PIN | For phone auth |
| **Inside/Outside CL** | ❌ Missing | City limits classification | Affects rates |
| **CHG Bill Type** | ❌ Missing | Change billing type flag | Administrative |
| **Check SVC** | ❌ Missing | Service verification checkbox | QA step |
| **Enter Authorize Persons** | ❌ Missing | Additional authorized contacts | Who can modify account |
| **Enter Comments** | ❌ Missing | Staff notes | Admin tracking |
| **IRIS Update** | ❌ Missing | Integration with IRIS utility system | System sync |
| **Scan Docs** | ❌ Missing | Document scanning tracker | Record keeping |
| **Email/Handout Welcome packet** | ❌ Missing | Onboarding completion | Customer service |

### Service Provisioning Fields

| Field | Current Status | Purpose |
|-------|---------------|---------|
| **TRASH SERVICES - New Build #** | ❌ Missing | New construction tracking |
| **TRASH SERVICES - Add Cart #** | ❌ Missing | Additional cart request |
| **TRASH SERVICES - Remove XCart #** | ❌ Missing | Cart removal tracking |
| **TRASH SERVICES - Added to Log** | ❌ Missing | Work order creation |
| **RECYCLE SERVICES - New Build #** | ❌ Missing | New construction tracking |
| **RECYCLE SERVICES - Add Cart #** | ❌ Missing | Additional recycling cart |
| **RECYCLE SERVICES - Remove XCart #** | ❌ Missing | Cart removal |
| **RECYCLE SERVICES - Added to Log** | ❌ Missing | Work order creation |
| **Notes** | ❌ Missing | Free-form staff notes |

---

## WHICH TEXAS COUNTIES USE THIS FORM?

Based on the form structure and the "City of Royse City" reference in the legal text, this is used by:

### Primary Users:
1. **Royse City, TX** (Rockwall County) - Confirmed
2. **Small to mid-size TX municipalities** with populations 10,000-50,000
3. **Municipal Utility Districts (MUDs)** in DFW metroplex

### Similar Forms Used By:
- Rockwall County utilities
- Collin County smaller cities
- Hunt County municipalities
- Kaufman County utilities
- Rural water districts in North Texas

### Common Features Across TX Counties:
- Combined water/trash/recycling application
- Landlord verification for rentals
- DL# and SSN requirements
- Property use classification
- Cart-based trash service

---

## CRITICAL MISSING FEATURES FOR AUTOMATION

### High Priority (Blocks Complete Automation)

1. **Email Address** - Essential for modern communications
2. **Property Ownership Type** - Affects entire process flow
3. **Landlord Information** - Required for rentals
4. **Mailing Address** - Often different from service address
5. **Date of Birth** - Identity verification
6. **Complete Co-Applicant Details** - Current implementation insufficient
7. **Trash/Recycle Cart Counts** - Service level and billing
8. **Property Features** (pool, sprinkler) - Rate calculation
9. **Digital Signature Capture** - Legal requirement
10. **Service Request Date** - Audit trail

### Medium Priority (Workflow Enhancement)

11. **Alternate/Work Phone Numbers** - Better contact reliability
12. **Bill Type Preference** - Customer satisfaction
13. **Service Territory** (Inside/Outside CL) - Rate determination
14. **Authorized Persons** - Account management
15. **PIN Generation** - Customer service authentication

### Low Priority (Administrative Convenience)

16. **IRIS System Integration Fields**
17. **Work Order Tracking Fields**
18. **Document Scanning Flags**
19. **Staff Comment Fields**
20. **Welcome Packet Tracking**

---

## DATABASE SCHEMA GAPS

### Current Schema Has:
```sql
- id, created_at, updated_at, status
- applicant_type (enum)
- name, phone
- service_start_date, service_stop_date
- property_address, property_city, property_state, property_postal_code
- drivers_license_number
- ssn_last4, ssn_encrypted (but encryption not implemented)
- lease_document_path, deed_document_path
- submitted_ip, submitted_user_agent
- metadata (jsonb catchall)
```

### Needs to Add:
```sql
- service_request_date DATE
- email TEXT NOT NULL
- mailing_address, mailing_city, mailing_state, mailing_postal_code
- date_of_birth DATE
- alternate_phone, work_phone TEXT
- bill_type ENUM('mail', 'email', 'both')
- property_use_type ENUM('rent', 'owner_occupied', 'owner_leasing')
- landlord_name, landlord_phone TEXT
- trash_cart_count, recycle_cart_count INT
- has_sprinkler_system BOOLEAN
- has_pool BOOLEAN
- service_territory ENUM('inside_city_limits', 'outside_city_limits')
- account_number TEXT (generated post-approval)
- customer_pin TEXT
- authorized_persons JSONB
- signature_image_path TEXT
- signature_timestamp TIMESTAMPTZ
- co_applicant_name, co_applicant_phone, co_applicant_email, 
  co_applicant_dob, co_applicant_dl_number, co_applicant_state,
  co_applicant_ssn_last4, co_applicant_signature_image_path TEXT
```

---

## BUSINESS LOGIC NOT YET IMPLEMENTED

### Deposit Calculation Rules
```
IF property_use_type = 'rent':
    - Require landlord verification
    - Higher deposit (typically $150-250)
    - Credit check required
ELSE IF property_use_type = 'owner_occupied':
    - Lower deposit (typically $50-100)
    - May waive with good credit
ELSE IF property_use_type = 'owner_leasing':
    - Medium deposit
    - Require property deed
```

### Rate Calculation Factors
```
Base Rate
+ (Inside/Outside City Limits multiplier)
+ (Pool surcharge if has_pool = true)
+ (Irrigation tier if has_sprinkler_system = true)
+ (Additional trash carts × cart_fee)
+ (Additional recycle carts × cart_fee)
```

### Document Requirements
```
IF property_use_type = 'rent':
    - Require lease_document
IF property_use_type = 'owner_occupied' OR 'owner_leasing':
    - Require deed_document
```

---

## WORKFLOW STATES NOT YET HANDLED

Current system has basic states:
- new
- in_review
- completed
- cancelled

### Should Have:
```
- new (submitted)
- pending_documents (waiting for lease/deed)
- pending_landlord_verification (for rentals)
- pending_credit_check
- pending_deposit
- approved
- scheduled_activation
- active
- suspended
- cancelled
- closed
```

---

## INTEGRATION POINTS FOR FULL AUTOMATION

### External Systems Needed:

1. **Credit Check API**
   - Experian/TransUnion integration
   - Uses SSN + DOB + Address

2. **Payment Processing**
   - Deposit collection
   - Auto-pay setup

3. **GIS/Property System**
   - Verify service address is in territory
   - Check existing account
   - Inside/outside city limits

4. **Work Order System** (IRIS mentioned in form)
   - Schedule meter turn-on
   - Trash cart delivery
   - Recycle bin delivery

5. **E-Signature Platform**
   - DocuSign or similar
   - Legal binding signatures

6. **Email/SMS Notifications**
   - Application status updates
   - Service activation confirmation
   - Welcome packet delivery

7. **Document Management**
   - Store lease agreements
   - Store property deeds
   - OCR for verification

---

## RECOMMENDED IMPLEMENTATION PHASES

### Phase 1: Critical Data Capture (Complete Form Digitization)
- Add all missing applicant/co-applicant fields
- Add property use type and landlord info
- Add trash/recycle cart fields
- Add property features (pool, sprinkler)
- Add email and bill type preference

### Phase 2: Enhanced Workflow
- Implement proper status states
- Add deposit calculation logic
- Add document requirement rules
- Add digital signature capture

### Phase 3: Backend Office Functions
- Add account number generation
- Add PIN creation
- Add authorized persons management
- Add staff notes and tracking

### Phase 4: System Integrations
- Credit check API
- Payment processing
- GIS property verification
- Work order system (IRIS)
- Email/SMS notifications

### Phase 5: Advanced Features
- Landlord portal for verification
- Online deposit payment
- Self-service status checking
- Mobile app support

---

## COMPLIANCE & LEGAL CONSIDERATIONS

### Must Have for TX Utilities:
1. ✅ SSN encryption (field exists but not used)
2. ❌ Digital signature with timestamp
3. ❌ Legal acknowledgment acceptance tracking
4. ❌ GDPR-like data retention policy
5. ❌ Audit trail for all data changes
6. ❌ Secure document storage

### TX Public Utility Commission Requirements:
- Customer notification requirements
- Disconnect notice procedures
- Landlord notification for rentals
- Credit/deposit amount limits
- Data privacy compliance

---

## NEXT STEPS FOR TEAM

1. **Review this analysis** with stakeholders
2. **Prioritize missing fields** based on business impact
3. **Update database schema** to include all fields
4. **Modify UI** to match paper form exactly
5. **Implement business logic** for deposit/rate calculations
6. **Add validation rules** matching TX utility regulations
7. **Test with actual Royse City data** if possible
8. **Plan integration** with existing IRIS or utility system

