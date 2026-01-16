import { z, ZodIssueCode } from 'zod'

/**
 * Required date validator
 * Accepts Date objects or ISO date strings (coerces to Date).
 * @param field - Name used in error messages
 */
export const requiredDate = (field: string = 'Value') =>
  z.preprocess(
    (val) => {
      if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val)
        return isNaN(d.getTime()) ? val : d
      }
      return val
    },
    z.date({
      error: (issue) =>
        issue.code === ZodIssueCode.invalid_type && issue.input === undefined
          ? `${field} is required`
          : `${field} must be a valid date`,
    })
  )

/**
 * Optional date validator
 * Accepts Date object or ISO string; allows undefined.
 */
export const optionalDate = (field: string = 'Value') => requiredDate(field).optional()

/**
 * Nullable date validator
 * Accepts Date object or ISO string; allows null.
 */
export const nullableDate = (field: string = 'Value') => requiredDate(field).nullable()


