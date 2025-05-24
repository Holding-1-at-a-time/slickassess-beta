import { v } from "convex/values"

// Custom validators for common patterns
export const validators = {
  // Email validation
  email: v.string(),

  // Phone number validation (E.164 format)
  phoneNumber: v.string(),

  // URL validation
  url: v.string(),

  // Vehicle VIN validation (17 characters)
  vin: v.string(),

  // License plate validation (alphanumeric, 2-8 characters)
  licensePlate: v.string(),

  // Positive number validation
  positiveNumber: v.number(),

  // Date string validation (ISO 8601)
  dateString: v.string(),

  // Price validation (positive number with max 2 decimals)
  price: v.number(),

  // Percentage validation (0-100)
  percentage: v.number(),
}

// Custom validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

export function validateVIN(vin: string): boolean {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin)
}

export function validateLicensePlate(plate: string): boolean {
  return plate.length >= 2 && plate.length <= 8 && /^[A-Z0-9]+$/.test(plate.toUpperCase())
}

export function validateDateString(date: string): boolean {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime()) && parsed.toISOString() === date
}

export function validatePrice(price: number): boolean {
  return price >= 0 && Number.isFinite(price) && Math.floor(price * 100) === price * 100
}

export function validatePercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100
}

// Validation error class
export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    public reason: string,
  ) {
    super(`Validation failed for field "${field}": ${reason}`)
    this.name = "ValidationError"
  }
}

// Validation helper for mutations
export function validate<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => boolean>,
): void {
  for (const [field, validator] of Object.entries(validators)) {
    if (!validator(data[field as keyof T])) {
      throw new ValidationError(field, data[field as keyof T], `Invalid value for ${field}`)
    }
  }
}

// Zod-like validation builder
export class ValidatorBuilder<T> {
  private validators: Array<(value: T) => boolean | string> = []

  constructor(private fieldName: string) {}

  min(minValue: number) {
    this.validators.push((value) =>
      typeof value === "number" && value >= minValue ? true : `Must be at least ${minValue}`,
    )
    return this
  }

  max(maxValue: number) {
    this.validators.push((value) =>
      typeof value === "number" && value <= maxValue ? true : `Must be at most ${maxValue}`,
    )
    return this
  }

  length(length: number) {
    this.validators.push((value) =>
      typeof value === "string" && value.length === length ? true : `Must be exactly ${length} characters`,
    )
    return this
  }

  minLength(minLength: number) {
    this.validators.push((value) =>
      typeof value === "string" && value.length >= minLength ? true : `Must be at least ${minLength} characters`,
    )
    return this
  }

  maxLength(maxLength: number) {
    this.validators.push((value) =>
      typeof value === "string" && value.length <= maxLength ? true : `Must be at most ${maxLength} characters`,
    )
    return this
  }

  pattern(regex: RegExp, message?: string) {
    this.validators.push((value) =>
      typeof value === "string" && regex.test(value) ? true : message || `Must match pattern ${regex}`,
    )
    return this
  }

  custom(validator: (value: T) => boolean | string) {
    this.validators.push(validator)
    return this
  }

  validate(value: T): void {
    for (const validator of this.validators) {
      const result = validator(value)
      if (result !== true) {
        throw new ValidationError(this.fieldName, value, typeof result === "string" ? result : "Validation failed")
      }
    }
  }
}

// Factory function for creating validators
export function createValidator<T>(fieldName: string): ValidatorBuilder<T> {
  return new ValidatorBuilder<T>(fieldName)
}
