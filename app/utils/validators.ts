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
 * Validate email address (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) return false;

  // Additional checks
  if (email.length > 254) return false; // RFC 5321

  const parts = email.split('@');
  if (parts[0].length > 64) return false; // Local part max length

  return true;
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
 * Validate driver's license number format (state-specific)
 */
export function validateDriversLicense(dlNumber: string, state?: string): { valid: boolean; message?: string } {
  const cleaned = dlNumber.trim().toUpperCase();

  if (cleaned.length === 0) {
    return { valid: false, message: 'Driver\'s license number is required' };
  }

  // State-specific validation for Texas (and other common states)
  if (state) {
    const stateUpper = state.toUpperCase();

    switch (stateUpper) {
      case 'TX': // Texas: 8 digits
        if (!/^\d{8}$/.test(cleaned)) {
          return { valid: false, message: 'Texas DL must be 8 digits' };
        }
        break;

      case 'CA': // California: 1 letter + 7 digits
        if (!/^[A-Z]\d{7}$/.test(cleaned)) {
          return { valid: false, message: 'California DL must be 1 letter followed by 7 digits' };
        }
        break;

      case 'FL': // Florida: 1 letter + 12 digits
        if (!/^[A-Z]\d{12}$/.test(cleaned)) {
          return { valid: false, message: 'Florida DL must be 1 letter followed by 12 digits' };
        }
        break;

      case 'NY': // New York: 9 digits or 1 letter + 18 digits
        if (!/^\d{9}$/.test(cleaned) && !/^[A-Z]\d{18}$/.test(cleaned)) {
          return { valid: false, message: 'Invalid New York DL format' };
        }
        break;

      default:
        // Generic validation for other states
        if (cleaned.length < 5 || cleaned.length > 20) {
          return { valid: false, message: 'DL must be 5-20 characters' };
        }
        if (!/^[A-Z0-9]+$/.test(cleaned)) {
          return { valid: false, message: 'DL must contain only letters and numbers' };
        }
    }
  } else {
    // No state provided - basic validation
    if (cleaned.length < 5 || cleaned.length > 20) {
      return { valid: false, message: 'DL must be 5-20 characters' };
    }
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      return { valid: false, message: 'DL must contain only letters and numbers' };
    }
  }

  return { valid: true };
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

/**
 * Validate and format phone number in real-time
 */
export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  
  if (!match) return value;
  
  const [, area, prefix, line] = match;
  
  if (line) {
    return `(${area}) ${prefix}-${line}`;
  } else if (prefix) {
    return `(${area}) ${prefix}`;
  } else if (area) {
    return `(${area}`;
  }
  
  return '';
}

/**
 * Validate phone number with detailed error message
 */
export function validatePhoneDetailed(phone: string): { valid: boolean; message?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  if (cleaned.length < 10) {
    return { valid: false, message: 'Phone number must be 10 digits' };
  }
  
  if (cleaned.length > 10) {
    return { valid: false, message: 'Phone number cannot exceed 10 digits' };
  }
  
  if (cleaned[0] === '0' || cleaned[0] === '1') {
    return { valid: false, message: 'Area code cannot start with 0 or 1' };
  }
  
  if (cleaned[3] === '0' || cleaned[3] === '1') {
    return { valid: false, message: 'Exchange code cannot start with 0 or 1' };
  }
  
  return { valid: true };
}

/**
 * Format SSN input in real-time
 */
export function formatSSNInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
  
  if (!match) return value;
  
  const [, area, group, serial] = match;
  
  if (serial) {
    return `${area}-${group}-${serial}`;
  } else if (group) {
    return `${area}-${group}`;
  } else if (area) {
    return area;
  }
  
  return '';
}

/**
 * Validate SSN with detailed error message
 */
export function validateSSNDetailed(ssn: string): { valid: boolean; message?: string } {
  const cleaned = ssn.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { valid: true }; // Optional field
  }
  
  if (cleaned.length < 9) {
    return { valid: false, message: 'SSN must be 9 digits' };
  }
  
  if (cleaned.length > 9) {
    return { valid: false, message: 'SSN cannot exceed 9 digits' };
  }
  
  // Cannot be all same digit
  if (/^(\d)\1{8}$/.test(cleaned)) {
    return { valid: false, message: 'Invalid SSN format' };
  }
  
  // Cannot start with 000, 666, or 900-999
  const firstThree = parseInt(cleaned.slice(0, 3));
  if (firstThree === 0) {
    return { valid: false, message: 'SSN cannot start with 000' };
  }
  if (firstThree === 666) {
    return { valid: false, message: 'SSN cannot start with 666' };
  }
  if (firstThree >= 900) {
    return { valid: false, message: 'SSN cannot start with 900-999' };
  }
  
  // Middle two digits cannot be 00
  const middleTwo = cleaned.slice(3, 5);
  if (middleTwo === '00') {
    return { valid: false, message: 'Invalid SSN format' };
  }
  
  // Last four digits cannot be 0000
  const lastFour = cleaned.slice(5);
  if (lastFour === '0000') {
    return { valid: false, message: 'Invalid SSN format' };
  }
  
  return { valid: true };
}

/**
 * Validate email with detailed error message
 */
export function validateEmailDetailed(email: string): { valid: boolean; message?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required' };
  }
  
  const trimmed = email.trim();
  
  if (trimmed.length > 254) {
    return { valid: false, message: 'Email is too long (max 254 characters)' };
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  const parts = trimmed.split('@');
  if (parts[0].length > 64) {
    return { valid: false, message: 'Email local part is too long' };
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = parts[1].toLowerCase();
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };
  
  if (commonTypos[domain]) {
    return { valid: false, message: `Did you mean ${commonTypos[domain]}?` };
  }
  
  return { valid: true };
}

/**
 * Validate postal code with detailed error message
 */
export function validatePostalCodeDetailed(zip: string): { valid: boolean; message?: string } {
  if (!zip || zip.trim().length === 0) {
    return { valid: true }; // Optional field
  }
  
  const cleaned = zip.replace(/\D/g, '');
  
  if (cleaned.length !== 5 && cleaned.length !== 9) {
    return { valid: false, message: 'ZIP code must be 5 or 9 digits' };
  }
  
  return { valid: true };
}

/**
 * Format ZIP code input in real-time
 */
export function formatZipCodeInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 5) {
    return cleaned;
  }
  
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
}

/**
 * Validate name field
 */
export function validateName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 160) {
    return { valid: false, message: 'Name is too long (max 160 characters)' };
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, message: 'Name must contain at least one letter' };
  }
  
  // Cannot be all numbers
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, message: 'Name cannot be all numbers' };
  }
  
  return { valid: true };
}

/**
 * Validate address field
 */
export function validateAddress(address: string): { valid: boolean; message?: string } {
  const trimmed = address.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, message: 'Address is required' };
  }
  
  if (trimmed.length < 5) {
    return { valid: false, message: 'Address must be at least 5 characters' };
  }
  
  if (trimmed.length > 240) {
    return { valid: false, message: 'Address is too long (max 240 characters)' };
  }
  
  // Must contain at least one number (street number)
  if (!/\d/.test(trimmed)) {
    return { valid: false, message: 'Address must include a street number' };
  }
  
  return { valid: true };
}

/**
 * Validate date of birth as string
 */
export function validateDOBString(dobString: string): { valid: boolean; message?: string } {
  if (!dobString || dobString.trim().length === 0) {
    return { valid: true }; // Optional field
  }
  
  const dob = new Date(dobString);
  
  if (isNaN(dob.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }
  
  return validateDOB(dob);
}

/**
 * Validate service date (can be future)
 */
export function validateServiceDate(dateString: string): { valid: boolean; message?: string } {
  if (!dateString || dateString.trim().length === 0) {
    return { valid: true }; // Optional field
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxFuture = new Date();
  maxFuture.setFullYear(maxFuture.getFullYear() + 1); // Max 1 year in future
  
  if (date > maxFuture) {
    return { valid: false, message: 'Date cannot be more than 1 year in the future' };
  }
  
  return { valid: true };
}
