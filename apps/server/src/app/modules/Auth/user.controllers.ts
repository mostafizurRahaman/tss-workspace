import { catchAsync, sendResponse } from '@repo/shared'
import { AuthServices } from './user.services'
import httpStatus from 'http-status'

// 1. Sign up
const signUp = catchAsync(async (req, res) => {
  const result = await AuthServices.signUp(req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: `User signed up successfully!`,
    data: result,
  })
})

// 2. Resend Signup otp :

const resendSignupOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.resendSignupOTP(req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `A new OTP has been sent to your email.`,
    data: result,
  })
})

// 3. Verify signup otp:
const verifySignupOTP = catchAsync(async (req, res) => {
  await AuthServices.verifySignupOTP(req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `OTP verified successfully!`,
    data: null,
  })
})
export const AuthController = {
  signUp,
  resendSignupOTP,
  verifySignupOTP,
}
