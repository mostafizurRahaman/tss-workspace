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

// 4. Login :
router.post('/login', validateRequest(AuthValidations.loginSchema), AuthController.login)

// 5. Forgot passwod:
router.post(
  '/forgot-password',
  validateRequest(AuthValidations.forgotPasswordSchema),
  AuthController.forgotPassword
)

// 6. Verify reset password otp:
router.post(
  '/verify-otp',
  validateRequest(AuthValidations.verifyResetPasswordOtpSchema),
  AuthController.verifyResetPasswordOtp
)

// 6. Verify reset password otp:
router.post(
  '/resend-otp',
  validateRequest(AuthValidations.resendOTPSchema),
  AuthController.resendOTP
)

// 8. Reset password:
router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPasswordSchema),
  AuthController.resetPassword
)

export const authRoutes = router
