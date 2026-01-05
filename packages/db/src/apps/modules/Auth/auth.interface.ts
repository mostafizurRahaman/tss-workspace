import { Document } from "mongoose";
import { TAuthRole, TAuthStatus } from "./auth.constant";

export interface IAuth extends Document {
   name: string;
   email: string;
   password: string;
   status: TAuthStatus;

   // roles:
   role: TAuthRole;

   // profile common properties:
   profileImage?: string;

   // 2FA:
   twoFactorSecret?: string;
   isTwoFactorEnabled: boolean;
   twoFactorBackupCodes?: string[];

   // reason:
   blockedReason?: string;
   deletionReason?: string;

   // common timestamps:
   blockedAt?: Date;
   deletedAt?: Date;
   passwordChangedAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}


export interface IAuthModel extends IAuth {
   
}