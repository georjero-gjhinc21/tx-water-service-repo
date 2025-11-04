# Water Service Request Form Automation - Implementation Checklist

## Current Implementation Status: ~30% Complete

---

## PHASE 1: COMPLETE DATA CAPTURE (PRIORITY: CRITICAL)
**Estimated Time**: 2-3 weeks  
**Goal**: Capture all fields from the physical form

### Frontend Updates

- [ ] **Step 1: Basic Contact Information** (2 days)
  - [x] Applicant name ✅
  - [x] Applicant phone ✅
  - [ ] Applicant email ❌ CRITICAL MISSING
  - [ ] Alternate phone number
  - [ ] Work phone number
  - [ ] Bill type preference (Mail/Email/Both) radio buttons
  
- [ ] **Step 2: Address Information** (2 days)
  - [x] Service address ✅
  - [x] Service city/state/zip ✅
  - [ ] "Mailing address same as service" checkbox
  - [ ] Conditional mailing address fields
  - [x] Service start date ✅
  - [x] Service stop date ✅
  - [ ] Service request date (auto-populated, read-only)
  
- [ ] **Step 3: Property & Services** (3 days)
  - [ ] Property use type radio buttons:
    - [ ] Rent (with landlord fields)
    - [ ] Owner - Will occupy
    - [ ] Owner - Will be leasing
  - [ ] Conditional landlord name field (required for rent)
  - [ ] Conditional landlord phone field (required for rent)
  - [ ] Trash carts needed (number input, default 1)
  - [ ] Recycle carts needed (number input, default 1)
  - [ ] Display fee information text
  - [ ] Property features checkboxes:
    - [ ] Sprinkler system
    - [ ] Pool
    - [ ] None
  
- [ ] **Step 4: Identity Verification** (3 days)
  - [x] Driver's license number ✅
  - [ ] Driver's license state dropdown
  - [ ] Date of birth date picker
  - [x] SSN input (masked) ✅
  - [ ] Co-applicant toggle/checkbox
  - [ ] Conditional co-applicant section:
    - [ ] Co-applicant name
    - [ ] Co-applicant email
    - [ ] Co-applicant phone
    - [ ] Co-applicant DL number
    - [ ] Co-applicant DL state
    - [ ] Co-applicant DOB
    - [ ] Co-applicant SSN
  - [x] Lease document upload ✅
  - [x] Deed document upload ✅
  - [ ] Conditional document requirements based on property use type
  
- [ ] **Step 5: Review & Sign** (2 days)
  - [ ] Display comprehensive summary
  - [ ] Legal acknowledgment text display
  - [ ] "I acknowledge" checkbox (required)
  - [ ] Digital signature pad for applicant
  - [ ] Conditional co-applicant signature pad
  - [ ] Date display for signatures

### Backend/Database Updates

- [ ] **Schema Migration** (1 day)
  - [ ] Run updated_schema.sql migration
  - [ ] Verify all constraints work correctly
  - [ ] Test enum types
  - [ ] Verify indexes created
  - [ ] Test triggers (updated_at, account_number_gen)
  
- [ ] **Server Action Updates** (2 days)
  - [ ] Update submitLead action to handle all new fields
  - [ ] Update Zod validation schema to match TypeScript types
  - [ ] Implement SSN encryption with pgp_sym_encrypt
  - [ ] Handle signature image uploads
  - [ ] Store legal acknowledgment text snapshot
  - [ ] Capture accurate IP and user agent
  
- [ ] **File Upload Handling** (1 day)
  - [ ] Implement Supabase Storage for signatures
  - [ ] Update lease/deed document upload paths
  - [ ] Add file size validation
  - [ ] Add file type validation
  - [ ] Generate unique filenames

---

## PHASE 2: BUSINESS LOGIC & VALIDATION (PRIORITY: HIGH)
**Estimated Time**: 2 weeks  
**Goal**: Implement TX utility business rules

### Validation Rules

- [ ] **Conditional Field Validation** (2 days)
  - [ ] If property_use_type = 'rent':
    - [ ] Require landlord_name
    - [ ] Require landlord_phone
    - [ ] Require lease_document upload
  - [ ] If property_use_type = 'owner_occupied' OR 'owner_leasing':
    - [ ] Require deed_document upload
  - [ ] If has_co_applicant = true:
    - [ ] Require co_applicant_name
    - [ ] Require co_applicant_phone
    - [ ] Require co_applicant_email
    - [ ] Require co_applicant_signature
  - [ ] If mailing_address_same_as_service = false:
    - [ ] Require all mailing address fields
    
- [ ] **Data Format Validation** (1 day)
  - [ ] Phone number formatting (strip non-digits, validate length)
  - [ ] SSN formatting (XXX-XX-XXXX)
  - [ ] Date validation (DOB must be 18+ years ago)
  - [ ] Email validation (proper format)
  - [ ] State code validation (2-letter codes)
  - [ ] ZIP code validation (5 or 9 digits)
  
- [ ] **Business Rule Validation** (2 days)
  - [ ] Service start date must be future or today
  - [ ] Service stop date must be after start date
  - [ ] Trash carts 0-10 range
  - [ ] Recycle carts 0-10 range
  - [ ] DL number format validation by state
  - [ ] Age verification (18+)

### Deposit Calculation

- [ ] **Deposit Logic Implementation** (3 days)
  - [ ] Create deposit calculation service
  - [ ] Base deposits by property use type:
    ```
    rent: $200
    owner_occupied: $75
    owner_leasing: $125
    ```
  - [ ] Territory multiplier:
    ```
    outside_city_limits: +$50
    ```
  - [ ] Credit check result adjustments:
    ```
    score < 600: +$100
    score 600-700: base
    score > 700: -$25
    ```
  - [ ] Display calculated deposit to user
  - [ ] Store in deposit_amount_required field

### Rate Calculation

- [ ] **Monthly Rate Calculation** (3 days)
  - [ ] Create rate calculation service
  - [ ] Base water rate: $35/month
  - [ ] Territory adjustment:
    ```
    outside_city_limits: +$10
    ```
  - [ ] Base trash: $15/month (1 cart included)
  - [ ] Additional trash carts: $5/cart/month
  - [ ] Base recycle: $8/month (1 cart included)
  - [ ] Additional recycle carts: $3/cart/month
  - [ ] Pool surcharge: +$15/month
  - [ ] Sprinkler system: Note about tier pricing
  - [ ] Display estimated monthly cost to user

---

## PHASE 3: ADMIN PANEL ENHANCEMENTS (PRIORITY: MEDIUM)
**Estimated Time**: 1.5 weeks  
**Goal**: Complete administrative workflows

### Admin Dashboard

- [ ] **Enhanced Dashboard** (2 days)
  - [ ] Statistics cards:
    - [ ] New requests
    - [ ] Pending landlord verification
    - [ ] Pending deposits
    - [ ] Scheduled activations
    - [ ] Active accounts
  - [ ] Quick action buttons
  - [ ] Filters by status
  - [ ] Date range filters
  - [ ] Search by name/address/account number
  
- [ ] **Request Detail Enhancements** (2 days)
  - [ ] Display ALL captured fields (currently missing many)
  - [ ] Show deposit calculation breakdown
  - [ ] Show rate calculation
  - [ ] Display signature images
  - [ ] Co-applicant section if applicable
  - [ ] Landlord verification section
  - [ ] Property features display
  - [ ] Service territory indicator
  
- [ ] **Workflow Actions** (3 days)
  - [ ] Generate account number button
  - [ ] Generate customer PIN button
  - [ ] Send landlord verification request
  - [ ] Mark landlord verified
  - [ ] Trigger credit check
  - [ ] Enter credit score/result
  - [ ] Send deposit payment link
  - [ ] Mark deposit paid
  - [ ] Schedule meter activation
  - [ ] Create work orders
  - [ ] Send welcome packet
  - [ ] Add staff notes
  - [ ] View audit log

### Reporting

- [ ] **Reports Implementation** (2 days)
  - [ ] Daily new requests report
  - [ ] Pending actions report
  - [ ] Activation schedule report
  - [ ] Revenue projections report
  - [ ] Export to CSV/Excel
  
---

## PHASE 4: INTEGRATIONS & AUTOMATION (PRIORITY: LOW-MEDIUM)
**Estimated Time**: 3-4 weeks  
**Goal**: Automate manual processes

### Credit Check Integration

- [ ] **Credit Bureau API** (1 week)
  - [ ] Choose provider (Experian/TransUnion/Equifax)
  - [ ] Implement API client
  - [ ] Handle SSN encryption/decryption
  - [ ] Parse credit score
  - [ ] Store results securely
  - [ ] Error handling & retries
  - [ ] Compliance logging

### Payment Processing

- [ ] **Deposit Payment** (1 week)
  - [ ] Integrate Stripe or Square
  - [ ] Create deposit payment page
  - [ ] Send payment link via email
  - [ ] Handle webhooks
  - [ ] Update deposit_paid status
  - [ ] Generate receipt
  - [ ] Refund handling (if needed)

### Email Notifications

- [ ] **Email Service Setup** (3 days)
  - [ ] Choose provider (SendGrid/AWS SES/Postmark)
  - [ ] Design email templates:
    - [ ] Application received
    - [ ] Documents needed
    - [ ] Landlord verification request
    - [ ] Deposit payment required
    - [ ] Credit check complete
    - [ ] Approval notification
    - [ ] Activation scheduled
    - [ ] Welcome to service
    - [ ] Status updates
  - [ ] Implement email sending service
  - [ ] Test deliverability

### SMS Notifications (Optional)

- [ ] **SMS Service** (2 days)
  - [ ] Integrate Twilio
  - [ ] Appointment reminders
  - [ ] Activation confirmations
  - [ ] Emergency notifications

### GIS/Property Verification

- [ ] **Address Validation** (3 days)
  - [ ] Google Maps API integration
  - [ ] Verify address exists
  - [ ] Check service territory (inside/outside)
  - [ ] Geocode location
  - [ ] Check for existing service at address

### Work Order System Integration

- [ ] **IRIS or Utility System** (1-2 weeks)
  - [ ] Research IRIS API documentation
  - [ ] Implement API client
  - [ ] Sync account data
  - [ ] Create meter turn-on work orders
  - [ ] Create trash cart delivery work orders
  - [ ] Create recycle bin delivery work orders
  - [ ] Bidirectional sync
  - [ ] Error handling & reconciliation

---

## PHASE 5: LEGAL & COMPLIANCE (PRIORITY: HIGH)
**Estimated Time**: 1 week  
**Goal**: Ensure legal compliance

### Digital Signature

- [ ] **E-Signature Implementation** (3 days)
  - [ ] Implement canvas-based signature pad
  - [ ] Convert to image
  - [ ] Store in Supabase Storage
  - [ ] Link to request record
  - [ ] Timestamp capture
  - [ ] IP address logging
  - [ ] E-SIGN Act compliance notes

### Legal Documentation

- [ ] **Terms & Conditions** (2 days)
  - [ ] Draft service terms
  - [ ] Get legal review
  - [ ] Version control system
  - [ ] Store version with each request
  - [ ] Display before signature
  
- [ ] **Data Privacy** (2 days)
  - [ ] Privacy policy creation
  - [ ] GDPR/CCPA considerations
  - [ ] Data retention policy
  - [ ] Data deletion procedures
  - [ ] SSN handling documentation

### Audit Trail

- [ ] **Audit Logging** (1 day)
  - [ ] Implement audit log table inserts
  - [ ] Log all status changes
  - [ ] Log all field updates
  - [ ] Log admin actions
  - [ ] Admin audit log viewer

---

## PHASE 6: TESTING & QUALITY ASSURANCE (PRIORITY: CRITICAL)
**Estimated Time**: 1-2 weeks  
**Goal**: Ensure reliability

### Unit Tests

- [ ] **Backend Tests** (3 days)
  - [ ] Validation schema tests
  - [ ] Deposit calculation tests
  - [ ] Rate calculation tests
  - [ ] SSN encryption/decryption tests
  - [ ] Business logic tests

### Integration Tests

- [ ] **End-to-End Tests** (3 days)
  - [ ] Complete application flow
  - [ ] All property use types
  - [ ] With/without co-applicant
  - [ ] Document uploads
  - [ ] Signature capture
  - [ ] Admin workflows

### User Acceptance Testing

- [ ] **UAT with Stakeholders** (1 week)
  - [ ] Test with actual utility staff
  - [ ] Test with sample customers
  - [ ] Gather feedback
  - [ ] Iterate on UX issues
  - [ ] Validate deposit/rate calculations
  - [ ] Validate legal compliance

---

## PHASE 7: DEPLOYMENT & MONITORING (PRIORITY: CRITICAL)
**Estimated Time**: 3-5 days  
**Goal**: Safe production rollout

### Pre-Launch

- [ ] **Security Audit** (2 days)
  - [ ] Penetration testing
  - [ ] SSN encryption verification
  - [ ] SQL injection tests
  - [ ] XSS vulnerability checks
  - [ ] CSRF protection verification
  - [ ] File upload security
  
- [ ] **Performance Testing** (1 day)
  - [ ] Load testing
  - [ ] Database query optimization
  - [ ] Image upload performance
  - [ ] API response times

### Launch

- [ ] **Deployment** (1 day)
  - [ ] Database migration (with backup)
  - [ ] Environment variables setup
  - [ ] Supabase Storage buckets
  - [ ] Domain/SSL configuration
  - [ ] Email service configuration
  - [ ] Payment processor keys
  
- [ ] **Monitoring** (1 day)
  - [ ] Error tracking (Sentry)
  - [ ] Analytics (Plausible/Google Analytics)
  - [ ] Uptime monitoring
  - [ ] Database monitoring
  - [ ] Alert setup

### Post-Launch

- [ ] **Training** (1-2 days)
  - [ ] Admin user training
  - [ ] Documentation creation
  - [ ] Video tutorials
  - [ ] FAQ document
  
- [ ] **Support Plan** (Ongoing)
  - [ ] Bug reporting process
  - [ ] Feature request process
  - [ ] Emergency contact
  - [ ] Regular check-ins

---

## SUMMARY: CRITICAL PATH

### MUST DO BEFORE LAUNCH (Estimated: 5-6 weeks)

1. ✅ Phase 1: Complete Data Capture (2-3 weeks) ← START HERE
2. ✅ Phase 2: Business Logic (2 weeks)
3. ✅ Phase 5: Legal & Compliance (1 week)
4. ✅ Phase 6: Testing (1-2 weeks)
5. ✅ Phase 7: Deployment (3-5 days)

### CAN BE DONE POST-LAUNCH (Estimated: 4-5 weeks)

6. Phase 3: Admin Enhancements (1.5 weeks)
7. Phase 4: Integrations (3-4 weeks)

---

## RESOURCE REQUIREMENTS

### Development Team

- **1 Full-Stack Developer**: 8-10 weeks
- **1 UI/UX Designer**: 1-2 weeks (Phase 1 & 3)
- **1 DevOps Engineer**: 3-5 days (Phase 7)

### External Resources

- **Legal Counsel**: 2-3 hours (terms review)
- **Credit Bureau Setup**: Account setup time
- **Payment Processor**: Account setup time
- **Utility Staff SME**: 10-15 hours (requirements validation)

---

## RISK MITIGATION

### High-Risk Items

1. **SSN Encryption**: Must be correct or serious legal issues
   - Mitigation: Thorough testing, security audit, legal review
   
2. **Data Loss**: Customer PII is sensitive
   - Mitigation: Automated backups, disaster recovery plan
   
3. **Integration Failures**: IRIS or external systems may fail
   - Mitigation: Graceful degradation, manual fallback procedures
   
4. **Signature Legal Validity**: E-signatures must be legally binding
   - Mitigation: Follow E-SIGN Act requirements, legal review

### Medium-Risk Items

1. **Credit Check API Costs**: Per-check fees can add up
   - Mitigation: Only run when necessary, cache results
   
2. **Email Deliverability**: Notifications may go to spam
   - Mitigation: Choose reputable provider, warm up domain

---

## SUCCESS METRICS

### Launch Targets

- [ ] 100% of form fields captured
- [ ] <5 seconds average form completion time per step
- [ ] 0 data loss incidents
- [ ] <2% form abandonment rate
- [ ] 95%+ first-time approval rate (with complete info)

### Post-Launch (3 months)

- [ ] 80% reduction in paper forms
- [ ] 50% reduction in manual data entry
- [ ] 90% customer satisfaction score
- [ ] <24 hour average approval time
- [ ] 100% audit trail compliance

---

## NEXT IMMEDIATE ACTIONS

### This Week

1. ✅ Review this complete analysis with team
2. ✅ Prioritize Phase 1 tasks
3. ✅ Assign developers to tasks
4. ✅ Set up project management board
5. ✅ Schedule daily standups

### Next Week

1. ✅ Begin Phase 1 frontend updates
2. ✅ Run database migration in dev environment
3. ✅ Start email field implementation (CRITICAL)
4. ✅ Begin property use type UI
5. ✅ Design signature pad component

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for team review and sprint planning
