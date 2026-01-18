/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRoles, AuthStatus, Otp, otpTypes, User, type IUser } from '@repo/db'
import type { IResendSignupType, ISignUpSchemaType, IVerifySignupOtpType } from './user.validations'
import { addTime, AppError, generateOtp, hashPassword } from '@repo/shared'
// import { sendEmail } from '@repo/email-sender'
import httpStatus from 'http-status'
import configs from '@app/configs'
import mongoose from 'mongoose'
import { renderEmail, SignupOTPEmail } from '@repo/email-templates'
import { sendEmail } from 'packages/email-sender/src'

// 1. Signup
const signUp = async (payload: ISignUpSchemaType) => {
  const { name, email, password } = payload

  // 1. Check existing user
  const existingUser = (await User.isUserExistByEmail(email)) as IUser
  console.log(existingUser)

  if (existingUser) {
    switch (existingUser.status) {
      case AuthStatus.ACTIVE:
        throw new AppError(
          httpStatus.CONFLICT,
          'An account with this email already exists. Please log in.'
        )

      case AuthStatus.PENDING:
        throw new AppError(
          httpStatus.CONFLICT,
          'Your account is not verified yet. Please verify your OTP.'
        )

      case AuthStatus.BLOCKED:
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Your account has been blocked. Please contact support.'
        )

      case AuthStatus.DELETED:
        throw new AppError(
          httpStatus.GONE,
          'This account was deleted. Please contact support to restore it.'
        )

      default:
        throw new AppError(httpStatus.CONFLICT, 'You already have an account.')
    }
  }

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

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

    // 7. Send OTP with rendered template
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
      name: newUser.name,
      email: newUser.email,
      password: '',
      status: newUser.status,
      role: newUser.role,
      isTwoFactorEnabled: newUser.isTwoFactorEnabled,
      isOtpVerified: newUser.isOtpVerified,
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
      updatedAt: newUser?.updatedAt,
    }
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new Error(error)
  }
}

// 2. Resend Signup otp:
const resendSignupOTP = async (payload: IResendSignupType) => {
  const { email } = payload

  // 1. Check existing user
  const user = (await User.isUserExistByEmail(email)) as IUser
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `User Doesn't exits!`)
  }

  if (user.status === AuthStatus.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked. Please contact support.'
    )
  }

  if (user.status === AuthStatus.DELETED) {
    throw new AppError(
      httpStatus.GONE,
      'This account was deleted. Please contact support to restore it.'
    )
  }

  if (user.isOtpVerified) {
    throw new AppError(httpStatus.CONFLICT, 'Your account already verified!')
  }

  // 2. Check Otp exists ? :
  const existingOtp = await Otp.findValidOtp(user._id?.toString(), otpTypes.SIGNUP)

  // 3. If existing otp still valid resend otp:
  if (existingOtp) {
    // Render Signup Template:
    const htmlTemplate = await renderEmail(
      SignupOTPEmail({
        userFirstName: user.name,
        companyName: configs.site.name,
        companyLogo: configs.site.logo as string,
        otpCode: existingOtp?.otp as string,
      })
    )

    //  Send OTP with rendered template
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
        to: user.email,
        html: htmlTemplate.html,
        subject: 'Your OTP for Account Verification',
      }
    )

    throw new AppError(
      httpStatus.BAD_REQUEST,
      'An OTP has already been sent and is still valid. Please check your email or wait for it to expire.'
    )
  }

  // 4. Generate new otp:
  const newOtp = generateOtp({ length: 6 })

  // 5. Create OTP:
  const savedOtp = await Otp.findOneAndUpdate(
    {
      user: user._id.toString(),
      type: otpTypes.SIGNUP,
    },
    {
      user: user._id.toString(),
      type: otpTypes.SIGNUP,
      otp: newOtp,
      expiresAt: addTime(configs.otpSettings.expiresIn, 'minutes', true),
    },
    {
      new: true,
    }
  )

  // 6. Render Signup Template:
  const htmlTemplate = await renderEmail(
    SignupOTPEmail({
      userFirstName: user.name,
      companyName: configs.site.name,
      companyLogo: configs.site.logo as string,
      otpCode: savedOtp?.otp as string,
    })
  )

  // 7. Send OTP with rendered template
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
      to: user.email,
      html: htmlTemplate.html,
      subject: 'Your OTP for Account Verification',
    }
  )

  return {
    geneated: true,
  }
}

// 3. verify signup otp:
const verifySignupOTP = async (payload: IVerifySignupOtpType) => {
  const { email, otp } = payload

  //  1. check is email exits with this email:
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `User doesn't exists!`)
  }

  // 2. check the status:
  if (user.status === AuthStatus.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked. Please contact support.'
    )
  }

  if (user.status === AuthStatus.DELETED) {
    throw new AppError(
      httpStatus.GONE,
      'This account was deleted. Please contact support to restore it.'
    )
  }

  // 3. Is already otp verified :
  if (user.isOtpVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, `You account already verified!`)
  }

  // 4. Find valid otp:
  const validOtp = await Otp.verifyAndConsumeOtp(user?._id?.toString(), otpTypes.SIGNUP, otp)

  if (!validOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid otp!')
  }

  user.isOtpVerified = true
  user.status = AuthStatus.ACTIVE
  await user.save()
}

export const AuthServices = {
  signUp,
  resendSignupOTP,
  verifySignupOTP,
}
