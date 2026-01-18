import { validateRequest } from '@app/middlewares'
import express, { Router } from 'express'
import { AuthValidations } from './user.validations'
import { AuthController } from './user.controllers'

const router: Router = express()

// 1. Sign up route:
router.post('/sign-up', validateRequest(AuthValidations.signUserSchema), AuthController.signUp)

// 2. Resend Signup Otp:
router.post(
  '/resend-signup-otp',
  validateRequest(AuthValidations.resendSignupOtpSchema),
  AuthController.resendSignupOTP
)

// 3. Verify signup otp:
router.post(
  '/verify-signup-otp',
  validateRequest(AuthValidations.verifySignupOtpSchema),
  AuthController.verifySignupOTP
)

export const authRoutes = router
