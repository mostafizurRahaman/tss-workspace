import { requiredEmail, requiredString } from '@repo/shared'
import z from 'zod/v4'

const signUserSchema = z.object({
  name: requiredString('Name'),
  email: requiredEmail('Email'),
  password: requiredString('Password').min(1, {
    error: `Password is required`,
  }),
})

const loginSchema = signUserSchema.pick({
  email: true,
  password: true,
})

export const AuthValidations = {
  signUserSchema,
  loginSchema,
}

export type ISignUpSchemaType = z.infer<typeof signUserSchema>

export type ILoginType = z.infer<typeof loginSchema>
