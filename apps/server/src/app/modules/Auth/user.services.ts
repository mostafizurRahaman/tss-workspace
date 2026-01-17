import { AuthRoles, AuthStatus, User, type IUser } from '@repo/db'
import type { ISignUpSchemaType } from './user.validations'
import { AppError, hashPassword } from '@repo/shared'
import httpStatus from 'http-status'
import configs from '@app/configs'

// 1. Signup 
const signUp = async (payload: ISignUpSchemaType) => {
  const { name, email, password } = payload

  // 1. check is user already with this email?:
  const exitingUser = await User.isUserExistByEmail(email)
  if (exitingUser) {
    throw new AppError(httpStatus.CONFLICT, `You have already an account!`)
  }

  // 2. hash password :
  const hashedPassword = await hashPassword(password, configs.passwordSoltRound)

  // 3. Prepare payload:
  const newPayload = {
    name,
    email,
    password: hashedPassword,
    status: AuthStatus.PENDING,

    // setup role:
    role: AuthRoles.USER,
  }

  // 4. Create the user:
  const newUser = await User.create(newPayload)

  if (!newUser._id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed!')
  }
  return newUser
}

// 2. Login: 

export const AuthServices = {
  signUp,
}
