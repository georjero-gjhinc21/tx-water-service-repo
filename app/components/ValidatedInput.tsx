"use client";

import { useState, useEffect } from "react";
import {
  validatePhoneDetailed,
  formatPhoneInput,
  validateEmailDetailed,
  validateSSNDetailed,
  formatSSNInput,
  validatePostalCodeDetailed,
  formatZipCodeInput,
} from '@/app/utils/validators';

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validator?: (value: string) => { valid: boolean; message?: string };
  formatter?: (value: string) => string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  helpText?: string;
  showValidation?: boolean;
}

export function ValidatedInput({
  label,
  value,
  onChange,
  validator,
  formatter,
  type = "text",
  placeholder,
  required = false,
  maxLength,
  helpText,
  showValidation = true,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message?: string }>({ valid: true });

  useEffect(() => {
    if (validator && touched && value) {
      setValidationResult(validator(value));
    }
  }, [value, touched, validator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (formatter) {
      newValue = formatter(newValue);
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (validator && value) {
      setValidationResult(validator(value));
    }
  };

  const showError = showValidation && touched && !validationResult.valid && validationResult.message;
  const showSuccess = showValidation && touched && value && validationResult.valid;

  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {showSuccess && <span className="text-emerald-600 text-xs">✓</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-md border px-3 py-2 outline-none transition ${
          showError
            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
            : showSuccess
            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            : 'border-zinc-300 focus:ring-2 focus:ring-blue-500'
        }`}
      />
      {showError && (
        <div className="mt-1 text-xs text-red-600">{validationResult.message}</div>
      )}
      {helpText && !showError && (
        <div className="mt-1 text-xs text-zinc-500">{helpText}</div>
      )}
    </label>
  );
}

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function PhoneInput({ label, value, onChange, required = false }: PhoneInputProps) {
  return (
    <ValidatedInput
      label={label}
      value={value}
      onChange={onChange}
      validator={validatePhoneDetailed}
      formatter={formatPhoneInput}
      type="tel"
      placeholder="(555) 123-4567"
      required={required}
      maxLength={14}
      helpText="10-digit US phone number"
    />
  );
}

interface EmailInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function EmailInput({ label, value, onChange, required = false }: EmailInputProps) {
  return (
    <ValidatedInput
      label={label}
      value={value}
      onChange={onChange}
      validator={validateEmailDetailed}
      type="email"
      placeholder="your.email@example.com"
      required={required}
      maxLength={254}
      helpText="We'll send confirmation to this email"
    />
  );
}

interface SSNInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function SSNInput({ label, value, onChange, required = false }: SSNInputProps) {
  return (
    <ValidatedInput
      label={label}
      value={value}
      onChange={onChange}
      validator={validateSSNDetailed}
      formatter={formatSSNInput}
      type="password"
      placeholder="123-45-6789"
      required={required}
      maxLength={11}
      helpText="Social Security Number (encrypted and secure)"
    />
  );
}

interface ZipCodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ZipCodeInput({ label, value, onChange, required = false }: ZipCodeInputProps) {
  return (
    <ValidatedInput
      label={label}
      value={value}
      onChange={onChange}
      validator={validatePostalCodeDetailed}
      formatter={formatZipCodeInput}
      type="text"
      placeholder="75001"
      required={required}
      maxLength={10}
      helpText="5 or 9 digit ZIP code"
    />
  );
}
