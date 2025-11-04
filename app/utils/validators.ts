// app/utils/validators.ts
// Data validation utilities

/**
 * Validate and format US phone number
 */
export function validatePhone(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // US phone must be 10 digits
  if (cleaned.length !== 10) return false;
  
  // Area code cannot start with 0 or 1
  if (cleaned[0] === '0' || cleaned[0] === '1') return false;
  
  return true;
}

/**
 * Format phone number for storage (digits only)
 */
export function formatPhoneForStorage(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Format phone number for display: (555) 123-4567
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  
  return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
}

/**
 * Validate Social Security Number
 */
export function validateSSN(ssn: string): boolean {
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

/**
 * Format SSN for display: XXX-XX-XXXX
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  
  return `${cleaned.slice(0,3)}-${cleaned.slice(3,5)}-${cleaned.slice(5)}`;
}

/**
 * Get last 4 digits of SSN
 */
export function getSSNLast4(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.slice(-4);
}

/**
 * Mask SSN for display: ***-**-1234
 */
export function maskSSN(ssnLast4: string): string {
  return `***-**-${ssnLast4}`;
}

/**
 * Validate date of birth (must be 18+)
 */
export function validateDOB(dob: Date): { valid: boolean; message?: string } {
  const today = new Date();
  
  // Cannot be in the future
  if (dob > today) {
    return { valid: false, message: 'Date of birth cannot be in the future' };
  }
  
  // Calculate age
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  
  const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
  
  // Must be at least 18 years old
  if (actualAge < 18) {
    return { valid: false, message: 'Applicant must be at least 18 years old' };
  }
  
  // Cannot be more than 120 years ago (reasonable limit)
  if (actualAge > 120) {
    return { valid: false, message: 'Invalid date of birth' };
  }
  
  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ZIP code (5 or 9 digits)
 */
export function validateZipCode(zip: string): boolean {
  const cleaned = zip.replace(/\D/g, '');
  return cleaned.length === 5 || cleaned.length === 9;
}

/**
 * Format ZIP code for display
 */
export function formatZipCode(zip: string): string {
  const cleaned = zip.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0,5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
}

/**
 * Validate US state code
 */
export function validateStateCode(state: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
  ];
  
  return validStates.includes(state.toUpperCase());
}

/**
 * Validate driver's license number format (basic validation)
 */
export function validateDriversLicense(dlNumber: string, state?: string): boolean {
  // Basic validation - just ensure it's not empty and has reasonable length
  const cleaned = dlNumber.trim();
  
  if (cleaned.length < 5 || cleaned.length > 20) {
    return false;
  }
  
  // State-specific validation could be added here
  // Each state has different DL formats
  
  return true;
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date >= today;
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return endDate > startDate;
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 500); // Limit length
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic']
): { valid: boolean; message?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      message: `File size must be less than ${maxSizeMB}MB` 
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `File type must be PDF or image (JPG, PNG, HEIC)` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate cart count
 */
export function validateCartCount(count: number): boolean {
  return count >= 0 && count <= 10 && Number.isInteger(count);
}
