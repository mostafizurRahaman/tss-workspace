/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRoles, AuthStatus, Otp, otpTypes, User } from '@repo/db'
import type { ISignUpSchemaType } from './user.validations'
import { addTime, AppError, generateOtp, hashPassword } from '@repo/shared'
// import { sendEmail } from '@repo/email-sender'
import httpStatus from 'http-status'
import configs from '@app/configs'
import mongoose from 'mongoose'
import { renderEmail, SignupOTPEmail } from '@repo/email-templates'
import { sendEmail } from 'packages/email-sender/src'

// 1. Signup
const signUp = async (payload: ISignUpSchemaType) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const { name, email, password } = payload

    // 1. Check existing user
    const existingUser = await User.isUserExistByEmail(email)

    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'You already have an account!')
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password, configs.passwordSoltRound)

    // 3. Create user (PENDING)
    const [newUser] = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          status: AuthStatus.PENDING,
          role: AuthRoles.USER,
        },
      ],
      { session }
    )

    if (!newUser?._id) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed!')
    }

    // 4. Generate OTP
    const otp = generateOtp({ length: configs.otpSettings.digits })

    // 5. Create OTP:
    const [savedOtp] = await Otp.create(
      [
        {
          user: newUser._id.toString(),
          type: otpTypes.SIGNUP,
          otp,
          expiresAt: addTime(configs.otpSettings.expiresIn, 'minutes', true),
        },
      ],
      { session }
    )

    // 6. Render Signup Template:
    const htmlTemplate = await renderEmail(
      SignupOTPEmail({
        userFirstName: name,
        companyName: configs.site.name,
        companyLogo: configs.site.logo as string,
        otpCode: savedOtp?.otp as string,
      })
    )

    // 6. Send OTP with rendered template
    await sendEmail(
      {
        host: configs.nodeMailer.host,
        port: configs.nodeMailer.port,
        pass: configs.nodeMailer.password,
        user: configs.nodeMailer.email,
        secure: configs?.nodeEnv === 'production',
      },
      {
        from: configs.nodeMailer.email,
        to: newUser.email,
        html: htmlTemplate.html,
        subject: 'Your OTP for Account Verification',
      }
    )

    await session.commitTransaction()
    session.endSession()

    return {
      userId: newUser._id,
      message: 'Signup successful. Please verify OTP.',
    }
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new Error(error)
  }
}

// 2. Login:

export const AuthServices = {
  signUp,
}
