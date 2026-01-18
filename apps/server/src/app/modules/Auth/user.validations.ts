import { requiredEmail, requiredString } from '@repo/shared'
import z from 'zod/v4'

const signUserSchema = z.object({
  body: z.object({
    name: requiredString('Name'),
    email: requiredEmail('Email'),
    password: requiredString('Password').min(1, {
      error: `Password is required`,
    }),
  }),
})

const loginSchema = z.object({
  body: signUserSchema.shape.body.pick({
    email: true,
    password: true,
  }),
})

const resendSignupOtpSchema = z.object({
  body: signUserSchema.shape.body.pick({
    email: true,
  }),
})

const verifySignupOtpSchema = z.object({
  body: z.object({
    ...signUserSchema.shape.body.pick({
      email: true,
    }),
    otp: requiredString('Otp')
      .length(6, { error: 'OTP must be exactly 6 digits' })
      .regex(/^\d+$/, { error: 'OTP must contain only numbers' }),
  }),
})

export const AuthValidations = {
  signUserSchema,
  loginSchema,
  resendSignupOtpSchema,
  verifySignupOtpSchema,
}

export type ISignUpSchemaType = z.infer<typeof signUserSchema.shape.body>

export type ILoginType = z.infer<typeof loginSchema.shape.body>
export type IResendSignupType = z.infer<typeof resendSignupOtpSchema.shape.body>
