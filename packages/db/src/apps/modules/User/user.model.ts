import { model, Schema, type HydratedDocument } from 'mongoose'

import { AuthRoles, AuthStatus } from './user.constant'
import type { IUser, IUserModel } from './user.interface'
import { comparePassword, createToken, hashPassword, type IJwtUserPayload } from '@repo/shared'

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: AuthStatus,
      default: AuthStatus.PENDING,
    },

    // roles:
    role: {
      type: String,
      enum: AuthRoles,
      default: AuthRoles.USER,
    },

    //  profile image:
    profileImage: {
      type: String,
    },

    twoFactorSecret: {
      type: String,
      select: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    twoFactorBackupCodes: {
      type: [String],
    },

    // otp verified:
    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // reason fields:
    blockedReason: {
      type: String,
    },
    deletionReason: {
      type: String,
    },

    // blocked at:
    blockedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
)

// 1. Find user with _id: (Object id)
userSchema.statics.getUserById = async function (id: string): Promise<IUser | null> {
  return this.findById(id)
}

// 2. Find User with email address:
userSchema.statics.isUserExistByEmail = async function (email: string): Promise<IUser | null> {
  return this.findOne({
    email,
  })
}

// 3. Check is user active by id:
userSchema.statics.isUserActive = async function (user: IUser) {
  return user.status === AuthStatus.ACTIVE
}

// 4. Check is user deleted by id:
userSchema.statics.isUserDeleted = async function (user: IUser) {
  return user.status === AuthStatus.DELETED
}

// 5. Check is user blocked by id:
userSchema.statics.isUserBlocked = async function (user: IUser) {
  return user.status === AuthStatus.BLOCKED
}

// 6. check is user under_review by id:
userSchema.statics.isUserUnderReview = async function (user: IUser) {
  return user.status === AuthStatus.IN_REVIEW
}

// 7. check is user in Pending  by id:
userSchema.statics.isUserStatusPending = async function (user: IUser) {
  return user.status === AuthStatus.PENDING
}

// 8. check is Twofactored enabled by id:
userSchema.statics.isTwoFactorEnabled = async function (user: IUser) {
  return user.isTwoFactorEnabled
}

// 9. hash password :
userSchema.pre('save', async function (this: HydratedDocument<IUser>) {
  if (!this.isModified('password')) return
  this.password = await hashPassword(this.password, 12)
})

// 10. hash password :
userSchema.post('save', async function (doc, next) {
  doc.password = ''
  next()
})

// 11. Compare Password:
userSchema.methods.comparePassword = async (newPassword: string, encryptedPassword: string) => {
  return await comparePassword(newPassword, encryptedPassword)
}

// 12. Access token generation:
userSchema.methods.createAccessToken = async (
  user: IUser,
  privateKey: string,
  expiresIn: number
): Promise<string> => {
  const payload: IJwtUserPayload = {
    _id: user?._id?.toString(),
    email: user?.email,
    name: user?.name,
    profileImage: user?.profileImage as string,
    status: user?.status,
  }
  const accessToken = (await createToken(payload, privateKey, expiresIn)) as string
  return accessToken
}

// 13. Refresh Token generation:
userSchema.methods.createRefreshToken = async (
  user: IUser,
  privateKey: string,
  expiresIn: number
): Promise<string> => {
  const payload: IJwtUserPayload = {
    _id: user?._id?.toString(),
    email: user?.email,
    name: user?.name,
    profileImage: user?.profileImage as string,
    status: user?.status,
  }
  const refreshToken = await createToken(payload, privateKey, expiresIn)
  return refreshToken as string
}

export const User = model<IUser, IUserModel>('User', userSchema)
