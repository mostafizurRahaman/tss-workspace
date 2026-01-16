import { catchAsync, sendResponse } from '@repo/shared'
import { AuthServices } from './user.services'
import httpStatus from 'http-status'
const signUp = catchAsync(async (req, res) => {
  const result = await AuthServices.signUp(req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: `User signed up successfully!`,
    data: result,
  })
})

export const AuthController = {
  signUp,
}
