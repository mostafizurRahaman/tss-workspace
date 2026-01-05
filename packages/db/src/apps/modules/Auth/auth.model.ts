import { model, Model, Schema } from "mongoose";
import { AuthRoles, AuthStatus } from "./auth.constant";
import { IAuth, IAuthModel } from "./auth.interface";

const authSchema = new Schema<IAuth>(
   {
      // common fields
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
);

authSchema.post

export const Auth = model<IAuth, IAuthModel>("Auth", authSchema);


